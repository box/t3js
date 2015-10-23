/**
 * @fileoverview Tests for DOMEventDelegate
 * @author Box
 */


describe('Box.DOMEventDelegate', function() {

	'use strict';

	leche.withData({
		native: [Box.NativeDOM],
		jquery: [Box.JQueryDOM]
	}, function(dom) {

		var sandbox = sinon.sandbox.create(),
			delegate;

		before(function() {
			Box.DOM = dom;
			var fixture = document.createElement('div');
			fixture.id = 'mocha-fixture';
			document.body.appendChild(fixture);
		});

		afterEach(function () {
			sandbox.verifyAndRestore();

			delegate = null;
			$('#mocha-fixture').empty();
		});

		after(function() {
			$('#mocha-fixture').remove();
		});

		/**
		 * Use jQuery to click an element. Need to do this because PhantomJS
		 * doesn't properly handle clicks otherwise.
		 * @param {HTMLElement} element The element to click.
		 * @returns {void}
		 * @private
		 */
		function click(element) {
			$(element).click();
		}

		describe('attachEvents()', function() {

			var testElement;

			beforeEach(function() {
				testElement = $('<div data-module="test"><input type="button" data-type="submit"></div>')[0];
				$('#mocha-fixture').append(testElement);
			});

			it('should respond to click when called with a click handler', function() {

				delegate = new Box.DOMEventDelegate(testElement, {
					onclick: sandbox.mock()
				});

				delegate.attachEvents();

				click(testElement.firstChild);
			});

			it('should pass three arguments to onclick when a data-type element is clicked', function() {

				delegate = new Box.DOMEventDelegate(testElement, {
					onclick: sandbox.mock().withExactArgs(
						sinon.match({ type: 'click' }),
						testElement.firstChild,
						'submit'
					)
				});

				delegate.attachEvents();

				click(testElement.firstChild);
			});

			it('should pass three arguments to onclick when a non-data-type element is clicked', function() {

				delegate = new Box.DOMEventDelegate(testElement, {
					onclick: sandbox.mock().withExactArgs(
						sinon.match({ type: 'click' }),
						null,
						''
					)
				});

				delegate.attachEvents();

				testElement.firstChild.removeAttribute('data-type');
				click(testElement.firstChild);
			});

			it('should respond to click only once when called twice', function() {

				delegate = new Box.DOMEventDelegate(testElement, {
					onclick: sandbox.mock()	// enforces one call
				});

				delegate.attachEvents();
				delegate.attachEvents();

				click(testElement.firstChild);
			});

		});

		describe('detachEvents()', function() {

			it('should not respond to click when called with a click handler', function() {
				var testElement = $('<div data-module="test"><input type="button"></div>')[0];
				$('#mocha-fixture').append(testElement);

				delegate = new Box.DOMEventDelegate(testElement, {
					onclick: sandbox.mock().never()
				});

				delegate.attachEvents();
				delegate.detachEvents();
				click(testElement.firstChild);
			});

		});

	});
});
