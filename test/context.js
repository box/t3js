/**
 * @fileoverview Tests for module context
 * @author Box
 */

module('Box.Context');

test('broadcast() should pass through to application when called', function() {

	var message = 'foo';
	var application = {
		broadcast: function() {
		}
	};

	this.mock(application).expects('broadcast').withArgs(message);
	var context = new Box.Context(application);

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
	var context = new Box.Context(application);

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
	var context = new Box.Context(application);

	equal(context.getService(serviceName), service, 'getService() should return correct service');

});

test('getConfig() should pass through module element and config name to application.getModuleConfig() when called', function() {

	var config = {},
		element = {},
		application = {
			getModuleConfig: function() {},

			// stub out DOM service
			getService: this.stub().returns({
				query: this.stub().returns(element)
			})
		};

	this.mock(application).expects('getModuleConfig').withArgs(element, 'foo').returns(config);
	var context = new Box.Context(application, 'test', 'test1');

	context.getConfig('foo');

});

test('getGlobalConfig() should pass through to application when called', function() {

	var application = {
		getGlobalConfig: function() {}
	};

	this.mock(application).expects('getGlobalConfig').withArgs('foo').returns('bar');
	var context = new Box.Context(application, 'test', 'test1');

	equal(context.getGlobalConfig('foo'), 'bar', 'correct config value returned');

});
