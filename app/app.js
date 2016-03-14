import Ember from 'ember';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
/* global L */

var App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  Resolver: Resolver
});

loadInitializers(App, config.modulePrefix);

L.mapbox.accessToken = 'pk.eyJ1IjoiYXJuYXVkc3B1aGxlciIsImEiOiJmTzJVdHI0In0.nTV2CIxVxzKvlta9_BvUsg';

export default App;
