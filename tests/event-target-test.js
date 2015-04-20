/**
 * @fileoverview Tests for event-target
 * @author Box
 */

describe('Box.EventTarget', function() {

	'use strict';

	var sandbox = sinon.sandbox.create();
	var eventTarget;

	beforeEach(function() {
		eventTarget = new Box.EventTarget();
	});

	afterEach(function() {
		sandbox.verifyAndRestore();
	});

	describe('Multiple event handlers', function() {

		it('should be called for custom event', function() {
			eventTarget.on('myevent', sandbox.mock());
			eventTarget.on('myevent', sandbox.mock());
			eventTarget.fire('myevent');
		});

		it('should be prevented for duplicate handlers', function() {
			var callback = sandbox.mock();
			eventTarget.on('myevent', callback);
			eventTarget.on('myevent', callback);
			eventTarget.on('myevent', callback);
			eventTarget.fire('myevent');
		});

	});

	describe('Separate event handlers', function() {

		it('should be called for separate custom events', function() {
			eventTarget.on('myevent1', sandbox.mock());
			eventTarget.on('myevent2', sandbox.mock().never());
			eventTarget.fire('myevent1');
		});

	});

	describe('Event handler', function() {

		it('should be called for custom event', function() {
			eventTarget.on('myevent', sandbox.mock());
			eventTarget.fire('myevent');
		});

		it('should be called for custom event', function() {
			eventTarget.on('myevent', sandbox.mock());
			eventTarget.fire('myevent');
		});

		it('should be called with custom event object for custom event', function() {
			var handler = sandbox.mock().withArgs({
				type: 'myevent',
				data: undefined
			});

			eventTarget.on('myevent', handler);
			eventTarget.fire('myevent');
		});

		it('should be called with custom event object and extra data for custom event', function() {
			var handler = sandbox.mock().withArgs({
				type: 'myevent',
				data: {
					foo: 'bar',
					time: 'now'
				}
			});

			eventTarget.on('myevent', handler);
			eventTarget.fire('myevent', {
				foo: 'bar',
				time: 'now'
			});
		});

		it('should not be called for custom event after being removed', function() {
			var handler = sandbox.spy();
			eventTarget.on('myevent', handler);

			eventTarget.off('myevent', handler);

			eventTarget.fire('myevent');
			assert.ok(handler.notCalled);
		});

		it('should be called even after another event handler for the same type removes itself', function() {
			var handler1,
				handler2 = sandbox.spy();

			handler1 = function() {
				// this handler removes itself
				this.off('myevent', handler1);
			};

			eventTarget.on('myevent', handler1);
			eventTarget.on('myevent', handler2);

			eventTarget.fire('myevent');
			assert.ok(handler2.called);
		});

	});
});
