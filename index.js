/*jshint node: true */
'use strict';
var fs = require('fs');
var path = require('path');
var mergeTrees = require('broccoli-merge-trees');
var Funnel = require('broccoli-funnel');

module.exports = {
  name: 'ember-data-factory-guy',

  treeForApp: function(appTree) {
    var trees = [appTree];

    if (this.includeFactoryGuyFiles) {
      try {
        if (fs.statSync('tests/factories').isDirectory()) {
          var factoriesTree = new Funnel('tests/factories', {
            destDir: 'tests/factories'
          });
          trees.push(factoriesTree);
        }
      } catch (err) {
        // do nothing;
      }
    }

    return mergeTrees(trees);
  },

  included: function(app) {
    this._super.included(app);
    this.app = app;

    this.setupFactoryGuyInclude(app);
    
    if (this.includeFactoryGuyFiles) {
      app.import(path.join(app.bowerDirectory, 'jquery-mockjax', 'dist', 'jquery.mockjax.js'));
    }
  },

  setupFactoryGuyInclude: function(app) {
    let defaultEnabled = /test|development/.test(app.env);
    let defaultSettings = { enabled: defaultEnabled, useScenarios: false };
    let userSettings = app.project.config(app.env).factoryGuy || {};
    let settings = Object.assign(defaultSettings, userSettings);
    if (settings.useScenarios) { settings.enabled = true; }

    this.includeFactoryGuyFiles = settings.enabled;
    // Have to be carefull not to exclude factory guy from addon tree
    // in development or test env
    let trees = /test|development/.test(app.env) ? 'app' : 'app|addon';
    this.treeExcludeRegex = new RegExp(trees);
  },
  
  treeFor: function(name) {
    // Not sure why this is necessary, but this stops the factory guy files
    // from being added to app tree. Would have thought that this would have
    // happened in treeForApp above, but not the case
    if (!this.includeFactoryGuyFiles && this.treeExcludeRegex && this.treeExcludeRegex.test(name)) {
      return;
    }
    return this._super.treeFor.apply(this, arguments);
  }
};
