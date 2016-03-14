import Ember from 'ember';


export default Ember.Route.extend({
  model: function() {
    var coords  = this.controllerFor('application').get('coords'),
        zoom    = this.controllerFor('application').get('zoomLevel'),
        filters = this.controllerFor('application').get('filters'),
        show    = this.controllerFor('application').get('showSlots'),
        lots    = Ember.A(),
        slots   = Ember.A();
    if (Object.keys(coords).length) {
      var sw     = coords.getSouthWest(),
          ne     = coords.getNorthEast();
      filters.swLat = sw.lat;
      filters.swLng = sw.lng;
      filters.neLat = ne.lat;
      filters.neLng = ne.lng;
      if (show && zoom >= 16) {
        slots = this.get('store').find('slot', filters);
      }
      lots = this.get('store').find('lot', {swLat: sw.lat, swLng: sw.lng,
        neLat: ne.lat, neLng: ne.lng});
    }
    return Ember.RSVP.hash({slots: slots, lots: lots});
  },
  actions: {
    reloadModel: function() {
      this.refresh();
    },
    loading: function() { // center and display loading spinner
      var spinner = Ember.$('#loading-spinner');
      spinner.css("top",
        Math.max(0, ((Ember.$(window).height() - spinner.outerHeight()) / 2) +
        Ember.$(window).scrollTop()) + "px");
      spinner.css("left",
        Math.max(0, ((Ember.$(window).width() - spinner.outerWidth()) / 2) +
        Ember.$(window).scrollLeft()) + "px");
      spinner.show();
      this.router.one('didTransition', function() {
        spinner.hide();
      });
    }
  }
});
