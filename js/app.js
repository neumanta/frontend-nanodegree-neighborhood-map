"use strict";


$(document).ready(function () {

    ko.applyBindings(viewModel);
});

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
    this.clickCount = ko.observable(data.clickCount);
    this.name = ko.observable(data.name);
    this.imgSrc = ko.observable(data.imgSrc);
    this.imgAttribution = ko.observable(data.imgAttribution);
    this.nicknames = ko.observableArray(data.nicknames);
    this.address = ko.observable(data.address);

    this.title = ko.computed(function() {
        var title;
        var clicks = this.clickCount();
        if (clicks < 10) {
            title = 'Newborn';
        } else {
            title = 'other'; // I didn't code all the options
        }
        return title;
    }, this);
};

var ViewModel = function() {
    var self = this;
    var filterTimeout;
    this.addingPlaces = false;

    self.Lat = ko.observable(12.24);
    self.Lng = ko.observable(24.54);

    this.placeList = ko.observableArray([]);
    this.mapMarkers = ko.observableArray([]);
    // var mapMarkers = [];  // Track the map markers

    this.searchFilter = ko.observable("");

    initialPlaces.sort(function(a,b) {
        // use a.name() because of the observables!
        var value = a.name == b.name ? 0 : 
            (a.name < b.name ? -1 : 1);
        // console.log("Sorting initial: (", value, ") ", a.name, " - ", b.name);
        return value;   // value used for debuging
    });

    this.incrementCounter = function() {
        self.currentPlace().clickCount(self.currentPlace().clickCount() + 1);
    };

    this.filterChanged = function() {
        // Start a timer to allow the user to finish typing
        //  otherwise the markers are not filtered properly
        clearTimeout(filterTimeout);    // clear any existing timer

        while (self.addingPlaces) {
            // Wait until prior add is complete
            console.log("waiting");
        }

        
        filterTimeout = setTimeout(self.addPlaces, 500);
    };

    this.addPlaces = function() {

        self.addingPlaces = true;
        self.placeList.removeAll();
        self.mapMarkers.removeAll();

        initialPlaces.forEach(function(place) { 
            var name = place.name.toUpperCase();
            var filter = self.searchFilter();
            console.log("Search Filter: ", filter);
            if (filter != null) {
                if (name.includes(filter.toUpperCase()))
                    self.placeList.push( new Place(place) );
            } else {
                self.placeList.push( new Place(place) );
            }
        });

        initializeMap(self);    // Now re-initialize the map markers

        self.addingPlaces = false;
    };


    this.setMarker = function(clickedMarker) {
        // Show the selected marker.

        console.log("clickedMarker: ", clickedMarker.title);

        // initializeMap.createMapMarker.infoWindow.open(map, clickedMarker);
        // $(clickedMarker).trigger("click");

        // infoWindow.open(map, clickedMarker);
        initializeMap.toggleBounce(clickedMarker);
    };

    this.addPlaces();
    this.currentPlace = ko.observable( self.placeList()[0] );

    // Call the add places when the search filter has been changed
    this.searchFilter.subscribe(function () {
        self.filterChanged();                
    });



};




var viewModel = new ViewModel();
initializeMap(viewModel);