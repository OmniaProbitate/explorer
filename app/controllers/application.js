import Ember from 'ember';
/* global google */
/* global L */
/* global moment */

var streetViewIcon = L.icon({
  iconUrl: '/explorer/images/street-view-icon.png',
  iconSize:     [69, 44],
  iconAnchor:   [34, 37]
});

// add a new object here for each city we serve
var cities_fixture = {
  montreal: {
    id: "montreal",
    name: "Montréal",
    lat: 45.483657,
    long: -73.637691
  },
  quebec: {
    id: "quebec",
    name: "Québec",
    lat: 46.802809,
    long: -71.242389
  },
  newyork: {
    id: "newyork",
    name: "New York",
    lat: 40.701231,
    long: -74.025000
  },
  boston: {
    id: "boston",
    name: "Boston",
    lat: 42.333152,
    long: -71.085998
  },
  seattle: {
    id: "seattle",
    name: "Seattle",
    lat: 47.607356,
    long: -122.331107
  }
};


export default Ember.Controller.extend({
  showSlots: true,
  showLots: false,
  showStreetView: false,
  city: cities_fixture["montreal"], // set default (GO HABS GO)
  slots: Ember.A(),
  lots: Ember.A(),
  searchResults: Ember.A(),
  geocoder: L.mapbox.geocoder('mapbox.places'),

  coords: {},
  filters: {},
  streetViewPosition: {pos: new google.maps.LatLng(45.483939, -73.562037), pov: 0},

  typeStatuses: [
    "Available at:",
    "Restricted at:"
  ],

  restrictTypeStatuses: [
    "All",
    "Paid Parking",
    "Permit Only",
    "Time Limited"
  ],

  isSearching: function() {
    return this.get("searchQuery");
  }.property("searchQuery"),

  doSearch: function() {
    var self = this;
    if (!this.get("searchQuery")) {
      return;
    }
    var queryOpts = {
      query: this.get("searchQuery"),
      proximity: this.get("map").getCenter()
    };
    this.get("geocoder").query(queryOpts, function(err, res) {
      if (err || !res.results) {
        self.set("searchResults", Ember.A());
      } else {
        console.log(res.results.features);
        self.set("searchResults", res.results.features);
      }
    });
  }.observes("searchQuery"),

  refreshCoords: function() {
    this.set("tooFarOut", this.get("zoomLevel") < 16); // show msg when map is too far to see slots
    this.send("refresh");
  }.observes("coords", "zoomLevel"),

  updateSlots: function() { // when model changes, push our slots to the map
    this.set("slots", this.get("model.slots"));
  }.observes("model"),

  changeStreetViewPosition: function() {
    var svp = this.get("streetViewPosition"),
        mkr = this.get("streetViewMarker"),
        ssv = this.get("showStreetView");
    if ((mkr && !ssv) || (!svp.pos && mkr)) { // remove map marker if street view drawer is closed
      this.get("map").removeLayer(mkr);
      this.set("streetViewMarker", null);
    } else if (ssv && svp.pos && !mkr) { // add map marker on SV moves if it doesn't exist yet
      mkr = L.marker([svp.pos.lat(), svp.pos.lng()], {icon: streetViewIcon, iconAngle: svp.pov});
      this.get("map").addLayer(mkr);
      this.set("streetViewMarker", mkr);
    } else if (ssv && svp.pos && mkr) { // update map marker location on SV moves
      mkr.setLatLng(new L.LatLng(svp.pos.lat(), svp.pos.lng()));
      mkr.setIconAngle(svp.pov);
    }
  }.observes("streetViewPosition", "showStreetView"),

  updateLotsData: function() {
    this.set("lots", this.get("showLots") ? this.get("model.lots") : Ember.A());
  }.observes("model", "showLots"),

  shouldShowLots: function() {
    return (this.get("city").id === "montreal" || this.get("city").id === "quebec");
  }.property("city"),

  actions: {
    changeCity: function(city) {
      this.set("city", cities_fixture[city]);
      this.send("reloadModel");
    },
    refresh: function() {
      this.send("reloadModel");
    },
    toggleSearch: function() {
      this.toggleProperty("showSearch");
    },
    toggleFilters: function() {
      this.toggleProperty("showFilters");
    },
    toggleStreetView: function() {
      this.toggleProperty("showStreetView");
    },
    showLots: function() {
      this.toggleProperty("showLots");
    },
    zoomToPoint: function(long, lat) {
      this.get("map").setView(new L.LatLng(lat, long), 20);
    },
    searchZoom: function(result) {
      var coords = result.geometry.coordinates;
      this.set("selectedSearchResult", result);
      this.get("map").setView(new L.LatLng(coords[1], coords[0]), Math.max(this.get("zoomLevel"), 18));
    },
    clearSearch: function() {
      this.set("selectedSearchResult", null);
      this.set("searchQuery", "");
    },
    clearFilters: function() {
      this.setProperties({
        filterDate: null,
        filterTime: null,
        filterDuration: null,
        filterType: "Available at:",
        filterRestrictType: "All",
        filters: {}
      });
      this.send('refresh');
    },
    runFilters: function() {
      var filters = {};
      var filterDateTime;
      if (this.get("filterDate") && this.get("filterTime")) {
        filterDateTime = moment.utc(this.get("filterDate"));
        filterDateTime.hour(this.get("filterTime").split(":")[0]).minute(this.get("filterTime").split(":")[1]);
        filters.checkin = filterDateTime.format('YYYY-MM-DDTHH:mm:00');
      } else {
        filters.checkin = null;
      }
      if (this.get("filterRestrictType") !== "All") {
        filters.type = this.get("restrictTypeStatuses").indexOf(this.get("filterRestrictType"));
      }
      filters.duration = this.get("filterDuration") || undefined;
      filters.invert = this.get("filterType") === "Restricted at:" || undefined;
      this.set("filters", filters);
      this.send('refresh');
    }
  }
});
