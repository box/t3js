/**
 * @fileoverview Tests for module context
 * @author Box
 */

describe('Box.Context', function() {

	'use strict';

	var sandbox = sinon.sandbox.create();
	var element = document.body;

	afterEach(function() {
		sandbox.verifyAndRestore();
	});

	describe('broadcast()', function() {

		it('should pass through to application when called', function() {
			var context,
				message = 'foo',
				application = {
					broadcast: function() {}
				};

			sandbox.mock(application).expects('broadcast').withArgs(message);
			context = new Box.Context(application, element);
			context.broadcast(message);
		});

		it('should pass through to application when called with arguments', function() {
			var context,
				message = 'foo',
				data = {},
				application = {
					broadcast: function() {}
				};

			sandbox.mock(application).expects('broadcast').withArgs(message, data);
			context = new Box.Context(application, element);
			context.broadcast(message, data);
		});

	});

	describe('getService()', function() {

		it('should pass through to application when called with service name', function() {
			var context,
				serviceName = 'foo',
				service = {},
				application = {
					getService: function() {}
				};

			sandbox.mock(application).expects('getService').withArgs(serviceName).returns(service);
			context = new Box.Context(application, element);
			assert.equal(context.getService(serviceName), service, 'getService() should return correct service');
		});

	});

	describe('getConfig()', function() {

		it('should pass through module element and config name to application.getModuleConfig() when called', function() {
			var context,
				config = {},
				application = {
					getModuleConfig: function() {}
				};

			sandbox.mock(application).expects('getModuleConfig').withArgs(element, 'foo').returns(config);
			context = new Box.Context(application, element);
			context.getConfig('foo');
		});
	});

	describe('getGlobal()', function() {

		it('should return the window-scope var when it exists', function () {
			var application = {
				getGlobal: function () {}
			};

			sandbox.stub(application, 'getGlobal').withArgs('foo').returns('bar');

			var context = new Box.Context(application, element);
			assert.strictEqual(context.getGlobal('foo'), 'bar', 'global var returned');
		});

	});


	describe('getGlobalConfig()', function() {

		it('should pass through to application when called', function() {
			var context,
				application = {
					getGlobalConfig: function() {}
				};

			sandbox.mock(application).expects('getGlobalConfig').withArgs('foo').returns('bar');
			context = new Box.Context(application, element);
			assert.equal(context.getGlobalConfig('foo'), 'bar', 'correct config value returned');
		});

	});

	describe('reportError()', function() {

		it('should pass through to application when called', function() {
			var context,
				application = {
					reportError: function() {}
				},
				exception = new Error('test error');

			sandbox.mock(application).expects('reportError').withArgs(exception);
			context = new Box.Context(application, element);

			context.reportError(exception);
		});

	});


});
