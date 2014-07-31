/**
 * @fileoverview Tests for module context
 * @author Box
 */

module('Box.Context', {

	setup: function() {
		this.element = document.querySelector('#mod-test1');
	}

});

test('broadcast() should pass through to application when called', function() {

	var message = 'foo';
	var application = {
		broadcast: function() {
		}
	};

	this.mock(application).expects('broadcast').withArgs(message);
	var context = new Box.Context(application, this.element);

	context.broadcast(message);

});

test('broadcast() should pass through to application when called with arguments', function() {

	var message = 'foo',
		data = {};

	var application = {
		broadcast: function() {
		}
	};

	this.mock(application).expects('broadcast').withArgs(message, data);
	var context = new Box.Context(application, this.element);

	context.broadcast(message, data);

});

test('getService() should pass through to application when called with service name', function() {

	var serviceName = 'foo',
		service = {};

	var application = {
		getService: function() {
		}
	};

	this.mock(application).expects('getService').withArgs(serviceName).returns(service);
	var context = new Box.Context(application, this.element);

	equal(context.getService(serviceName), service, 'getService() should return correct service');

});

test('getConfig() should pass through module element and config name to application.getModuleConfig() when called', function() {

	var config = {},
		application = {
			getModuleConfig: function() {}
		};

	this.mock(application).expects('getModuleConfig').withArgs(this.element, 'foo').returns(config);
	var context = new Box.Context(application, this.element);

	context.getConfig('foo');

});

test('getGlobalConfig() should pass through to application when called', function() {

	var application = {
		getGlobalConfig: function() {}
	};

	this.mock(application).expects('getGlobalConfig').withArgs('foo').returns('bar');
	var context = new Box.Context(application, this.element);

	equal(context.getGlobalConfig('foo'), 'bar', 'correct config value returned');

});

test('reportError() should pass through to application when called', function() {

	var exception = new Error('test error');
	var application = {
		reportError: function() {
		}
	};

	this.mock(application).expects('reportError').withArgs(exception);
	var context = new Box.Context(application, this.element);

	context.reportError(exception);

});
