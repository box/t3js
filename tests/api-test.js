/**
 * @fileoverview Tests for T3 API (package.json and dist files)
 * @author Box
 */

/* eslint-env node */
/* eslint strict: [2, "global"] */

'use strict';

// @NOTE(nzakas): This file runs in Node.js, not Karma!

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var assert = require('assertive-chai').assert,
	leche = require('leche'),
	path = require('path'),
	defaultT3 = require('../dist/t3'),
	nativeT3 = require('../dist/t3-native'),
	jqueryT3 = require('../dist/t3-jquery'),
	pkg = require('../package.json');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

describe('API', function() {

	describe('Defaults', function() {
		it('should use native DOM in default file', function() {
			assert.equal(defaultT3.DOM.type, 'native');
		});

		it('should use native DOM in native file', function() {
			assert.equal(nativeT3.DOM.type, 'native');
		});

		it('should use jQuery DOM in jQuery file', function() {
			assert.equal(jqueryT3.DOM.type, 'jquery');
		});
	});

	describe('Exports', function() {

		leche.withData({
			'Default T3': defaultT3,
			'Native T3': nativeT3,
			'jQuery T3': jqueryT3
		}, function(T3) {

			leche.withData([
				'DOM',
				'DOMEventDelegate',
				'EventTarget',
				'Application',
				'Context'
			], function(name) {
				it('should have Box.' + name, function() {
					assert.isDefined(T3[name]);
				});
			});

		});

	});

	describe('package.json', function() {

		it('should export native T3', function() {
			assert.equal(require(path.join('../', pkg.main)), nativeT3);
		});

	});

});
