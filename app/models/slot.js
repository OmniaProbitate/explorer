import DS from 'ember-data';

export default DS.Model.extend({
  wayName: DS.attr('string'),
  geojson: DS.attr(),
  buttonLocations: DS.attr(),
  rules: DS.attr(),
  restrictTypes: DS.attr(),
  isSlotPaid: function() {
    return this.get('restrictTypes').indexOf('paid') >= 0;
  }.property('restrictTypes'),
  slotColour: function() {
    return this.get('isSlotPaid') ? '#EAB417' : '#485966';
  }.property('isSlotPaid'),
  descriptions: function() {
    var results = [];
    if (this.get('rules')) {
      this.get('rules').forEach(function(rule) {
        results.push(rule.description);
      });
    }
    return results;
  }.property('rules'),
  agendas: function() {
    var results = [];
    if (this.get('rules')) {
      this.get('rules').forEach(function(rule) {
        results.push(JSON.stringify(rule.agenda));
      });
    }
    return results;
  }.property('rules'),
  mapPopupString: function() {
    return "<strong>"+this.get("wayName")+"</strong> &mdash; ID #"+this.get("id")+"<br />"+this.get('descriptions').join("<br />")+"<br />"+(this.get('permitNumber') ? "Permit number "+this.get("permitNumber") : "");
  }.property('descriptions'),
  permitNumber: function() {
    var num = null;
    if (this.get('rules')) {
      this.get('rules').forEach(function(rule) {
        if (rule.permit_no) { num = rule.permit_no; }
      });
    }
    return num;
  }.property('rules')
});
