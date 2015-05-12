/**
 * @fileoverview Tests for DOM abstraction layer
 * @author Box
 */


describe('Box.DOM', function() {
	'use strict';

	leche.withData({
		native: [Box.NativeDOM],
		jquery: [Box.JQueryDOM]
	}, function(dom) {
		var sandbox = sinon.sandbox.create();

		var testModule,
			nestedModule;

		before(function() {
			Box.DOM = dom;
			var fixture = document.createElement('div');
			fixture.id = 'mocha-fixture';
			document.body.appendChild(fixture);
		});

		beforeEach(function() {
			testModule = $('<div id="test-module" data-module="test"><button id="module-target" data-type="target"></button></div>')[0];
			nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
			$('#mocha-fixture').append(testModule, nestedModule);
		});

		afterEach(function() {
			sandbox.verifyAndRestore();

			$('#mocha-fixture').empty();
		});

		after(function() {
			$('#mocha-fixture').remove();
		});

		describe('type', function() {
			it('should match type value of passed in event type', function() {
				assert.equal(Box.DOM.type, dom.type);
			});
		});

		describe('query()', function() {
			it('should return first element when multiples exist', function() {
				var testEl = Box.DOM.query(document.getElementById('mocha-fixture'), 'div');

				assert.equal(testEl, testModule);
			});

			it('should return null when no matches exist', function() {
				var testEl = Box.DOM.query(document.getElementById('mocha-fixture'), 'article');

				assert.isNull(testEl);
			});

			it('should return the element when exactly one match exists', function() {
				var testEl = Box.DOM.query(document.getElementById('mocha-fixture'), 'button');
				var testBtn = document.getElementById('module-target');

				assert.equal(testEl, testBtn);
			});
		});

		describe('queryAll()', function() {
			it('should return all elements when multiples exist', function() {
				var testEl = Box.DOM.queryAll(document.getElementById('mocha-fixture'), 'div');

				assert.equal(testEl.length, 3);
			});

			it('should return an empty array when no matches exist', function() {
				var testEl = Box.DOM.queryAll(document.getElementById('mocha-fixture'), 'article');

				assert.equal(testEl.length, 0);
			});

			it('should return an array of one element when exactly one match exists', function() {
				var testEl = Box.DOM.queryAll(document.getElementById('mocha-fixture'), 'button');
				var testBtn = document.getElementById('module-target');

				assert.equal(testEl.length, 1);
				assert.equal(testEl[0].id, testBtn.id);
			});
		});

		describe('on()', function() {
			it('should call an attached function', function() {
				var testBtn = document.getElementById('module-target');
				Box.DOM.on(testBtn, 'click', sandbox.mock());

				testBtn.click();
			});
		});

		describe('off()', function() {
			it('should not call a function when it\'s listener has been turned off', function() {
				var neverEver = sandbox.mock().never();
				var testBtn = document.getElementById('module-target');
				Box.DOM.on(testBtn, 'click', neverEver);
				Box.DOM.off(testBtn, 'click', neverEver);

				testBtn.click();
			});
		});
	});
});
