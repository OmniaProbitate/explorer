import DS from 'ember-data';
import ruleToString from '../utils/rule-to-string';


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
  ruleStrings: function() {
    var results = "";
    if (this.get('rules')) {
      this.get('rules').forEach(function(rule) {
        var rts = ruleToString(rule);
        results += ("<p><strong>" + rts[0] + "</strong><br />");
        results += (rts[1] + "</p>");
      });
    }
    return results;
  }.property('rules'),
  mapPopupString: function() {
    return "<h4>"+this.get("wayName")+"</h4><hr />"+this.get('ruleStrings')+"<br /><small>ID #"+this.get("id")+"</small>";
  }.property('ruleStrings')
});
