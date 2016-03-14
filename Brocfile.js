/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var pickFiles = require('broccoli-static-compiler');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import('bower_components/bootstrap/dist/js/bootstrap.js');
app.import('bower_components/bootstrap/dist/css/bootstrap.css');
app.import('bower_components/bootstrap/dist/css/bootstrap.css.map', {
  destDir: 'assets'
});
app.import('bower_components/moment/moment.js');
app.import('bower_components/mapbox.js/mapbox.js');
app.import('bower_components/mapbox.js/mapbox.css');
app.import('bower_components/leaflet-plugins/layer/Marker.Rotate.js');
app.import('bower_components/Leaflet.EasyButton/src/easy-button.js');
app.import('bower_components/Leaflet.EasyButton/src/easy-button.css');
app.import("bower_components/fontawesome/css/font-awesome.css");

var mapbox = pickFiles('bower_components/mapbox.js/images', {
    srcDir: '/',
    destDir: 'assets/images'
});

var fontAwesome = pickFiles('bower_components/fontawesome/fonts', {
    srcDir: '/',
    destDir: 'fonts'
});

module.exports = app.toTree([mapbox, fontAwesome]);
