import Ember from 'ember';
/* global L */
/* global google */

var searchIcon = L.icon({
  iconUrl: '/explorer/images/search-grn.png',
  iconSize:     [48, 48],
  iconAnchor:   [24, 46],
  popupAnchor:  [0, -32]
});

var lotIcon = L.icon({
  iconUrl: '/explorer/images/lots-blu.png',
  iconSize:     [25, 30],
  iconAnchor:   [12, 15],
  popupAnchor:  [0, -32]
});

var defaultZoneStyle = {
  color: '#d7524b', opacity: 1, fillOpacity: 0.60, fillColor: '#fff'
};

var defaultLineStyle = function(zoom, lnColour) {
  var style = {color: lnColour, weight: 5, opacity: 1, fill: false};
  if (zoom <= 16) { style.weight = 2; }
  return style;
};

var defaultMarkerStyle = function(zoom, mkColour) {
  return {color: '#fff', weight: 2, opacity: 1, fillColor: mkColour, fillOpacity: 1, radius: zoom / 2.5};
};

var selectedLineStyle = function(zoom) {
  var style = {color: '#d7524b', weight: 5, opacity: 1, fill: false};
  if (zoom <= 16) { style.weight = 2; }
  return style;
};

var selectedMarkerStyle = function(zoom) {
  return {color: '#fff', weight: 2, opacity: 1, fillColor: '#d7524b', fillOpacity: 1, radius: zoom / 2};
};

var updateLotsData = function(self) {
  var activeIcon = lotIcon;

  self.get("lotsLayer").clearLayers();
  self.get("lots").forEach(function(i) {
    // add marker icon
    var marker = L.marker([i.get("lat"), i.get("long")], {icon: activeIcon});

    // marker click events
    marker.on('click', function(e) {
      marker.unbindPopup();
      L.popup().setLatLng(e.latlng).setContent(i.get("mapPopupString")).openOn(self.get("map"));
      self.get("map").setView(new L.LatLng(i.get("lat"), i.get("long")),
        Math.max(self.get("zoomLevel"), 15));
    });

    self.get("lotsLayer").addLayer(marker);
  });
};


export default Ember.Component.extend({
  tagName: 'div',
  elementId: 'map',

  loadMap: function() {
    var self = this,
        city = this.get("city");

    var map = L.mapbox.map('map', 'arnaudspuhler.l54pj66f', {featureLayer: false, maxZoom: 22});
    map.setView([city.lat, city.long], 11);

    Ember.$.getJSON('/v1/areas', function(data) {
      var url = data.versions[data.latest_version].geojson_mask_addr.split('.gz')[0];
      Ember.$.ajax(url, {
        success: function(filedata) {
          L.geoJson(filedata, defaultZoneStyle).addTo(self.get("map"));
        }
      });
    });

    map.on("moveend zoomend", function() {
      self.set("coords", map.getBounds());
      self.set("zoomLevel", map.getZoom());
    });

    this.setProperties({
      lotsLayer: new L.featureGroup(),
      normalSlotsLayer: new L.featureGroup(),
      normalSlotsMarkerLayer: new L.featureGroup(),
      paidSlotsLayer: new L.featureGroup(),
      paidSlotsMarkerLayer: new L.featureGroup(),
      searchLayer: new L.featureGroup()
    });

    this.get("lotsLayer").addTo(map);
    this.get("normalSlotsLayer").addTo(map);
    this.get("normalSlotsMarkerLayer").addTo(map);
    this.get("paidSlotsLayer").addTo(map);
    this.get("paidSlotsMarkerLayer").addTo(map);
    this.get("searchLayer").addTo(map);
    this.get("lotsLayer").bringToFront();
    this.get("searchLayer").bringToFront();
    this.set("map", map);

    updateLotsData(this);
    this.set("coords", map.getBounds());
    this.set("zoomLevel", map.getZoom());
  }.on("didInsertElement"),

  changeCity: function() {
    var city = this.get("city");
    this.get("map").setView(new L.LatLng(city.lat, city.long), 11);
  }.observes("city"),

  changeSearchResults: function() {
    if (!this.get("selectedSearchResult")) {
      this.get("searchLayer").clearLayers();
      return;
    }
    var coords = this.get("selectedSearchResult").geometry.coordinates;
    this.get("searchLayer").clearLayers();
    var marker = L.marker(coords.reverse(), {icon: searchIcon});
    this.get("searchLayer").addLayer(marker);
  }.observes("selectedSearchResult"),

  changeSlots: function() {
    var self = this;
    this.get("normalSlotsLayer").clearLayers();
    this.get("normalSlotsMarkerLayer").clearLayers();
    this.get("paidSlotsLayer").clearLayers();
    this.get("paidSlotsMarkerLayer").clearLayers();
    this.set("selectedSlot", null);

    if (!this.get("slots.length")) {
      return;
    }
    this.get("slots").forEach(function(i) {
      var markers = [];
      // add slot line and button
      var line = L.polyline(i.get("geojson").coordinates.map(function(i) {
        return new L.LatLng(i[1], i[0]);
      }), defaultLineStyle(self.get("zoomLevel"), i.get("slotColour")));
      i.get("buttonLocations").forEach(function(b) {
        var marker = L.circleMarker(new L.LatLng(b.lat, b.long), defaultMarkerStyle(self.get("zoomLevel"), i.get("slotColour")));
        markers.push(marker);
      });

      // line/marker click events
      line.on('click', function(e) {
        if (!i.get("rules.length")) {
          i.reload().then(function(r) {
            line.unbindPopup();
            L.popup().setLatLng(e.latlng).setContent(r.get("mapPopupString")).openOn(self.get("map"));
          });
        } else {
          line.unbindPopup();
          L.popup().setLatLng(e.latlng).setContent(i.get("mapPopupString")).openOn(self.get("map"));
        }
        self.set("streetViewPosition", {pos: new google.maps.LatLng(e.latlng.lat, e.latlng.lng), pov: 0, from_map: true});
        self.get("normalSlotsLayer").setStyle(defaultLineStyle(self.get("zoomLevel"), '#485966'));
        self.get("normalSlotsMarkerLayer").setStyle(defaultMarkerStyle(self.get("zoomLevel"), '#485966'));
        self.get("paidSlotsLayer").setStyle(defaultLineStyle(self.get("zoomLevel"), '#EAB417'));
        self.get("paidSlotsMarkerLayer").setStyle(defaultMarkerStyle(self.get("zoomLevel"), '#EAB417'));
        e.target.setStyle(selectedLineStyle(self.get("zoomLevel")));
        markers.forEach(function(b) {
          b.setStyle(selectedMarkerStyle(self.get("zoomLevel")));
        });
        self.set("selectedSlot", i);
      });

      markers.forEach(function(b) {
        b.on('click', function(e) {
          if (!i.get("rules.length")) {
            i.reload().then(function(r) {
              b.unbindPopup();
              L.popup().setLatLng(e.latlng).setContent(r.get("mapPopupString")).openOn(self.get("map"));
            });
          } else {
            b.unbindPopup();
            L.popup().setLatLng(e.latlng).setContent(i.get("mapPopupString")).openOn(self.get("map"));
          }
          self.set("streetViewPosition", {pos: new google.maps.LatLng(e.latlng.lat, e.latlng.lng), pov: 0, from_map: true});
          self.get("normalSlotsLayer").setStyle(defaultLineStyle(self.get("zoomLevel"), '#485966'));
          self.get("normalSlotsMarkerLayer").setStyle(defaultMarkerStyle(self.get("zoomLevel"), '#485966'));
          self.get("paidSlotsLayer").setStyle(defaultLineStyle(self.get("zoomLevel"), '#EAB417'));
          self.get("paidSlotsMarkerLayer").setStyle(defaultMarkerStyle(self.get("zoomLevel"), '#EAB417'));
          line.setStyle(selectedLineStyle(self.get("zoomLevel")));
          markers.forEach(function(x) {
            x.setStyle(selectedMarkerStyle(self.get("zoomLevel")));
          });
          self.set("selectedSlot", i);
        });
      });

      self.get((i.get("isSlotPaid") ? "paid" : "normal")+"SlotsLayer").addLayer(line);
      if (self.get("zoomLevel") >= 18) { // only show button on zoom lvl 19 and +
        markers.forEach(function(b) {
          self.get((i.get("isSlotPaid") ? "paid" : "normal")+"SlotsMarkerLayer").addLayer(b);
        });
      }
    });

    this.get("normalSlotsMarkerLayer").bringToFront();
    this.get("paidSlotsLayer").bringToFront();
    this.get("paidSlotsMarkerLayer").bringToFront();
    this.get("searchLayer").bringToFront();
  }.observes("slots"),

  updateLots: function() {
    updateLotsData(this);
  }.observes("lots")
});
