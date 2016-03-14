import Ember from 'ember';
/* global moment */

export function formatDate(date) {
  // return the provided ISO-8601 date as a pretty locale-friendly datestring
  return new Ember.Handlebars.SafeString(moment(date[0]).format("lll"));
}

export default Ember.HTMLBars.makeBoundHelper(formatDate);
