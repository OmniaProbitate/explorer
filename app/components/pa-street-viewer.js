import Ember from 'ember';
/* global google */

export default Ember.Component.extend({
  tagName: 'div',
  elementId: 'street-viewer',

  setupStreetView: function() {
    var self = this,
        position = this.get("position");
    var panoramaOptions = {
      position: position.pos,
      zoom: 1,
      imageDateControl: true
    };
    var myPano = new google.maps.StreetViewPanorama(
        document.getElementById("street-viewer-content"),
        panoramaOptions);
    myPano.setVisible(true);
    google.maps.event.addListener(myPano, 'position_changed', function() {
      self.set("position", {pos: myPano.getPosition(), pov: myPano.getPov().heading});
    });
    google.maps.event.addListener(myPano, 'pov_changed', function() {
      self.set("position", {pos: myPano.getPosition(), pov: myPano.getPov().heading});
    });
    this.set("streetViewer", myPano);
  }.on("didInsertElement"),

  changeStreetView: function() {
    var coords = this.get("position");
    if (coords.from_map) {
      this.get("streetViewer").setPosition(coords.pos);
    }
  }.observes("position")
});
