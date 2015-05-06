/**
 * @fileoverview Karma configuration for T3 development.
 * @author nzakas
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// None!

//------------------------------------------------------------------------------
// Public
//------------------------------------------------------------------------------

module.exports = function(config) {

	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '../',

		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha'],

		// list of files / patterns to load in the browser
		files: [
			'tests/utils/assert.js',
			'node_modules/assertive-chai/assertive-chai.js',
			'node_modules/sinon/pkg/sinon.js',
			'node_modules/jquery/dist/jquery.js',
			'node_modules/leche/dist/leche.js',
			'tests/utils/common-setup.js',
			'lib/box.js',
			'lib/dom-native.js',
			'lib/dom-jquery.js',
			'lib/context.js',
			'lib/event-target.js',
			'lib/application.js',
			'tests/*.js'
		],

		// list of files to exclude
		exclude: [
		],

		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
			'lib/*.js': ['coverage']
		},

		// web server port
		port: 9876,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['PhantomJS'],

		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['mocha', 'coverage', 'threshold'],

		// output HTML report of code coverage
		coverageReporter: {
			type: 'html',
			dir: 'coverage-client'
		},

		// set coverage limits
		thresholdReporter: {
			statements: 94,
			branches: 80,
			functions: 98,
			lines: 94
		},

		// output console.log calls to the console (default is false)
		captureConsole: true,

		// enable / disable colors in the output (reporters and logs)
		colors: true,

		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO
	});

};
