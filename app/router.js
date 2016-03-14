import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: '/explorer/'
});

Router.map(function() {
  this.route('login');
  this.route('cities');
  this.route('explore');
  this.route('lots');
});

export default Router;
