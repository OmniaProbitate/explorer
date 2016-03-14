import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  city: DS.attr('string'),
  address: DS.attr('string'),
  operator: DS.attr('string'),
  agenda: DS.attr(),
  capacity: DS.attr('number'),
  attrs: DS.attr(),
  geojson: DS.attr(),
  active: true,
  lat: function() {
    return this.get('geojson').coordinates[1];
  }.property('geojson'),
  long: function() {
    return this.get('geojson').coordinates[0];
  }.property('geojson'),
  timesTable: function() {
    var self = this;
    var tableText = "Open (Day, times, price per day)<br />";
    var days = [["7","Sun"],["1","Mon"],["2","Tue"],["3","Wed"],["4","Thu"],["5","Fri"],["6","Sat"]];
    days.forEach(function(z) {
      tableText += "<strong>"+z[1]+":</strong> ";
      var times = self.get("agenda")[z[0]].map(function(x) {
        if (x.daily === null && x.max === null) { return []; }
        return x.hours.map(function(y){return y.toString().endsWith(".5")?y.toString().split(".")+":30":y.toString().split(".")[0]+":00";}).join(" to ")+", "+(x.daily ? "$"+x.daily : "$"+x.max)+"/day; ";
      });
      tableText += times.join("");
      tableText += "<br />";
    });
    return tableText;
  }.property('agenda'),
  mapPopupString: function() {
    return "<strong>"+this.get("name")+"</strong> &mdash; ID #"+this.get("id")+"<br />"+this.get("operator")+"<br />"+this.get('address')+"<hr />"+this.get("timesTable");
  }.property('name', 'address', 'operator', 'timesTable')
});
