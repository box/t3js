/**
 * @fileoverview Testing Bundle for T3
 * @author Box
 */

'use strict';

var applicationStub = require('./application-stub'),
	TestServiceProvider = require('./test-service-provider'),
	EventTarget = require('./event-target');

// Create namespace
var Box = {
	Application: applicationStub,
	TestServiceProvider: TestServiceProvider,
	EventTarget: EventTarget
};

// Write to global window if it exists
if (window) {
	// Initialize namespace
	window.Box = window.Box || {};

	// Copy all properties onto namespace (ES3 safe for loop)
	for (var key in Box) {
		if (Box.hasOwnProperty(key)) {
			window.Box[key] = Box[key];
		}
	}
}

module.exports = Box;
