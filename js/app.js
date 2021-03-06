"use strict";


$(document).ready(function () {

	ko.applyBindings(viewModel);
});
var mapInitialized = false;

/* ======= Model ======= */

var initialPlaces = [
	{
		clickCount : 0,
		name : 'Cheddar\'s Casual Cafe',
		url : 'http://www.cheddars.com/',
		imgSrc : 'http://www.cheddars.com/wp-content/uploads/2012/02/hostess1.jpg',
		imgAttribution : 'http://www.cheddars.com/',
		address : 'Aurora, CO 80016'
	},
	{
		clickCount : 0,
		name : 'Dairy Queen / Orange Julius',
		url : 'http://www.dairyqueen.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Dusty Boot Foxfield',
		url : 'http://dustybootfoxfield.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'AMC Arapahoe Crossing 16',
		url : 'https://www.amctheatres.com/movie-theatres/denver/amc-arapahoe-crossing-16',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Old Chicago Arapahoe Crossings',
		url : 'http://www.oldchicago.com/locations/aurora-arapahoe-crossing',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Golden Corral',
		url : 'http://www.goldencorral.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Target',
		url : 'http://www.target.com/sl/aurora-south--target-store/2458#?afid=storeloc&cpng=CO&Inm=aurora-south_2458',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Dragonfly Asian Bistro Cornerstar',
		url : 'http://www.dragonflyasian.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'AT&T Cornerstar',
		url : '',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},    
	{
		clickCount : 0,
		name : 'King Soopers Arapahoe Crossings',
		url : 'https://www.kingsoopers.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Conoco Arapahoe Crossings',
		url : 'http://www.conocophillips.com/Pages/default.aspx',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Jackson\'s All American Sports Grill',
		url : 'http://jacksonsallamerican.com/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	},
	{
		clickCount : 0,
		name : 'Dick\'s Sporting Goods Cornerstar',
		url : 'http://stores.dickssportinggoods.com/co/aurora/366/',
		imgSrc : '',
		imgAttribution : '',
		address : 'Foxfield, CO'
	}
];


var Place = function(data) {
	var self = this;
	self.clickCount = ko.observable(data.clickCount); // maintained for future feature.
	self.name = ko.observable(data.name); // Maintained as observable for future feature.
	self.imgSrc = ko.observable(data.imgSrc);
	self.imgAttribution = ko.observable(data.imgAttribution);
	self.nicknames = ko.observableArray(data.nicknames);
	self.address = ko.observable(data.address);
	self.map = null;    // prepare for the map variable

};

var ViewModel = function() {
	var self = this;
	var filterTimeout;
	self.addingPlaces = false;

	self.Lat = ko.observable(12.24);
	self.Lng = ko.observable(24.54);
	self.placeList = ko.observableArray();
	self.mapMarkers = ko.observableArray();
	self.mapSites = ko.observableArray();
	self.wikiSites = ko.observableArray();

	self.searchFilter = ko.observable("");

	// 11/3/2015 Changing how the filter query is used.
	//		prior version had problems with delayed typing
	self.filterQuery = ko.observable("");
	self.locations = ko.observableArray();
	// self.filteredLocationsBound = ko.observableArray();
	self.filteredLocations = ko.observableArray();

	self.filteredLocationsBound = self.filteredLocations;

	initialPlaces.sort(function(a,b) {
		// use a.name() because of the observables!
		var value = a.name == b.name ? 0 : 
			(a.name < b.name ? -1 : 1);
		// console.log("Sorting initial: (", value, ") ", a.name, " - ", b.name);
		return value;   // variable used for debuging
	});

	self.incrementCounter = function() {
		self.currentPlace().clickCount(self.currentPlace().clickCount() + 1);
	};

	self.filterChanged = function() {

		return;

		// Start a timer to allow the user to finish typing
		//  otherwise the markers are not filtered properly
		clearTimeout(filterTimeout);    // clear any existing timer

		// Clear the wiki site selection
		self.wikiSites.removeAll();

		while (self.addingPlaces) {
			// Wait until prior add is complete
			console.log("waiting");
		}

		
		filterTimeout = setTimeout(self.addPlaces, 200);
	};

	self.addPlaces = function() {

		// console.log("******* addPlaces Called");

		self.addingPlaces = true;
		self.placeList.removeAll();
		self.mapMarkers.removeAll();
		self.mapSites.removeAll();

		initialPlaces.forEach(function(place) { 
			// Filter on the title rather than the name.
			//		This will provide the proper name that is
			//		displayed in the list, rather than the full
			//		detailed name
			var name = place.name.toUpperCase();
			console.log("place: ", place);
			// var name = place.title.toUpperCase();
			
			var filter = self.searchFilter();
			console.log("Search Filter: ", filter);
			if (filter !== null) {
				if (name.includes(filter.toUpperCase())) {
					console.log("name: ", name, " includes: ", filter);
					self.placeList.push( new Place(place) );
				}
			} else {
				self.placeList.push( new Place(place) );
			}
		});

		if (mapInitialized) {
			console.log("calling initializeMap(self)");
			initializeMap(self);    // Now re-initialize the map markers
		}

		self.addingPlaces = false;
	};


	self.setMarker = function(clickedMapSite) {
		// Show the selected marker.

		// First close existing open map sites
		for (var i = 0; i < viewModel.mapSites().length; i++) {
		  console.log("window title: ", viewModel.mapSites()[i]);
		  viewModel.mapMarkers()[i].setAnimation(null);
		  viewModel.mapSites()[i].infoWindow.close();
		}    

		console.log("clicked mapSite: ", clickedMapSite.title);

		if (!clickedMapSite.isOpen) {
			clickedMapSite.marker.setAnimation(google.maps.Animation.BOUNCE);
			clickedMapSite.infoWindow.open(self.map, clickedMapSite.marker);
			clickedMapSite.isOpen = true;
		} else {
			clickedMapSite.marker.setAnimation(null);
			clickedMapSite.infoWindow.close();
			clickedMapSite.isOpen = false;
		}

		self.loadWikiElements(clickedMapSite.title);

	};

	self.setWiki = function(clickedWikiSite) {
		console.log("Clicked Wiki Site: ", clickedWikiSite.title);
		// Open a page to the selected Wiki Site
		if (clickedWikiSite.url !== "") {
			window.open(clickedWikiSite.url, "_blank");
		}
	};

	self.loadWikiElements = function(searchName) {
		// Setup the Wikipedia link information
		// Based on the Udacity video sample presented
		//      in the Building the Move Planner App vide
		var wikiUrl = 'http://en.wikipedia.org/w/api.' +
				'php?action=opensearch&search=' + searchName + 
				'&format=json&callback=wikiCallback';

		console.log("wikiUrl: ", wikiUrl);

		// Clear the wiki text so the new list can be loaded
		self.wikiSites.removeAll();

		var wikiRequestTimeout = setTimeout(function() {
			viewModel.wikiSites.push( {
				title: "failed to get wikipedia resources",
				url: ""
			});
		}, 2000);

		$.ajax({
			url: wikiUrl,
			dataType: "jsonp",
			// jsonp: "callback" (This line is redundant since it's in the URL, but retained for reference)
			success: function ( response ) {
				var articleList = response[1];

				if (articleList.length > 0) {
					for (var i = 0; i < articleList.length; i++) {
						console.log("articleList[i]:", i, "   ", articleList[i]);
						var articleStr = articleList[i];
						var url = 'http://en.wikipedia.org/wiki/' + articleStr;

						viewModel.wikiSites.push( {
							title: articleStr,
							url: url
						});

					}
				}
				else
				{
					viewModel.wikiSites.push( {
						title: "No Wikipedia links found.",
						url: ""
					});				
				}

				clearTimeout(wikiRequestTimeout);
			}
		});     

	};


	self.addPlaces();
	self.currentPlace = ko.observable( self.placeList()[0] );

	// Call the add places when the search filter has been changed
	/*
		self.searchFilter.subscribe(function () {
			self.filterChanged();                
		});
	*/


};


var viewModel = new ViewModel();
// set the default filter to all sites
// viewModel.filteredLocationsBound = viewModel.mapSites;

viewModel.mapSites.subscribe( function ( value ) {
	// When a map site has changed, update the filter locations
    var value = viewModel.filterQuery();
    if (value == "") {
	    viewModel.filteredLocations( viewModel.mapSites()
	        .filter( function (el ) {
	        	return true;
	        } ) );
    }
    else {
	    viewModel.filteredLocations( viewModel.mapSites()
	        .filter( function ( el ) {
	            return el.title.toLowerCase()
	                .indexOf( value.toLowerCase() ) > -1;
	        } ) );
	}

} );

viewModel.filterQuery.subscribe( function ( value ) {

	viewModel.wikiSites.removeAll();

	if (mapInitialized) {
		console.log("filter with value: ", value);
		if (value == "") {
			// Show all the map sites (locations)
			viewModel.filteredLocations( viewModel.mapSites()
		        .filter( function ( el ) {
		            return true;
		        } ) );
		}
		else {

			// Setup the filter based on the entred text
		    viewModel.filteredLocations( viewModel.mapSites()
		        .filter( function ( el ) {
		            return el.title.toLowerCase()
		                .indexOf( value.toLowerCase() ) > -1;
		        } ) );

			// First hide all the existing markers
			viewModel.mapSites().forEach( function(site) {
				// console.log("marker title:", site.title);
				site.marker.setVisible(false);
			});

			// viewModel.filteredLocationsBound = viewModel.filteredLocations;
			// viewModel.filteredLocationsBound.valueHasMutated();
		}


		// Set the map markers to show only the filtered selection
		var bounds = window.mapBounds;

		viewModel.filteredLocationsBound().forEach( function(site) {
			
			// console.log("marker title:", site.title);
			site.marker.setVisible(true);

			// Next we setup the markers to ensure we can change 
			//	the map extents (position based on markers)
			var lat = site.marker.position.lat();  // latitude from the place service
			var lon = site.marker.position.lng();  // longitude from the place service

			bounds.extend(new google.maps.LatLng(lat, lon));
			// fit the map to the new marker
			viewModel.map.fitBounds(bounds);
			// center the map
			viewModel.map.setCenter(bounds.getCenter());

		});


		
		// refresh the new map bounds
		window.mapBounds = new google.maps.LatLngBounds();			
	
		console.log("mapSites: ", viewModel.mapSites().length);
		console.log("filteredLocations: ", viewModel.filteredLocations().length);
		console.log("filteredLocationsBound: ", viewModel.filteredLocationsBound().length);

	}

} );

function initMap() {
	console.log("initMap Called...");
	initializeMap(viewModel);  


}