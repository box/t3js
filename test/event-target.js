module('Box.EventTarget', {

	setup: function() {
		this.eventTarget = new Box.EventTarget();
	}

});

test('Event handler should be called for custom event', function() {

	this.eventTarget.on('myevent', this.mock());
	this.eventTarget.fire('myevent');

});

test('Multiple event handlers should be called for custom event', function() {

	this.eventTarget.on('myevent', this.mock());
	this.eventTarget.on('myevent', this.mock());
	this.eventTarget.fire('myevent');

});

test('Separate event handlers should be called for separate custom events', function() {

	this.eventTarget.on('myevent1', this.mock());
	this.eventTarget.on('myevent2', this.mock().never());
	this.eventTarget.fire('myevent1');

});

test('Event handler should be called with custom event object for custom event', function() {

	var handler = this.mock().withArgs({
		type: 'myevent',
		data: undefined
	});

	this.eventTarget.on('myevent', handler);
	this.eventTarget.fire('myevent');

});

test('Event handler should be called with custom event object and extra data for custom event', function() {

	var handler = this.mock().withArgs({
		type: 'myevent',
		data: {
			foo: 'bar',
			time: 'now'
		}
	});

	this.eventTarget.on('myevent', handler);
	this.eventTarget.fire('myevent', {
		foo: 'bar',
		time: 'now'
	});

});

test('Event handler should not be called for custom event after being removed', function() {

	var handler = sinon.spy();
	this.eventTarget.on('myevent', handler);

	this.eventTarget.off('myevent', handler);

	this.eventTarget.fire('myevent');
	ok(handler.notCalled);

});

