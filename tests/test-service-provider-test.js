/**
 * @fileoverview Tests for TestServiceProvider
 * @author Box
 */

describe('Box.TestServiceProvider', function() {

	'use strict';

	var sandbox = sinon.sandbox.create();
	var testServiceProvider;

	beforeEach(function() {
		Box.Application.reset();
	});

	afterEach(function() {
		sandbox.verifyAndRestore();

		Box.Application.reset();
	});

	describe('new Box.TestServiceProvider', function() {

		it('should set this.stubs to serviceStubs when called', function() {
			var serviceStub = {
				bar: 'baz'
			};
			testServiceProvider = new Box.TestServiceProvider({
				foo: serviceStub
			});

			assert.propertyVal(testServiceProvider.stubs, 'foo', serviceStub);
		});

		it('should set allowedServicesList to this.allowedServicesList when called', function() {
			testServiceProvider = new Box.TestServiceProvider({}, ['example-service']);

			assert.deepEqual(testServiceProvider.allowedServicesList, ['example-service']);
			assert.deepEqual(testServiceProvider.serviceInstances, {});
		});

	});

	describe('getService()', function() {

		var stubbedService1 = { service: '1'},
			stubbedService2 = { service: '2'},
			preRegisteredService2 = { service: 'pre-2'},
			preRegisteredService3 = { service: 'pre-3' };

		beforeEach(function() {
			// Pre-register services
			var getServiceForTestStub = sandbox.stub(Box.Application, 'getServiceForTest');
			getServiceForTestStub.withArgs('service2').returns(preRegisteredService2);
			getServiceForTestStub.withArgs('service3').returns(preRegisteredService3);
			getServiceForTestStub.returns(null);

			testServiceProvider = new Box.TestServiceProvider({
				service1: stubbedService1,
				service2: stubbedService2
			}, ['service2', 'service3', 'service4']);
		});

		it('should return the stubbed version of a service when a stub is available', function() {
			assert.deepEqual(testServiceProvider.getService('service1'), stubbedService1);
		});

		it('should return the stubbed version of a service when a stub and a pre-registered service are available', function() {
			assert.deepEqual(testServiceProvider.getService('service2'), stubbedService2);
		});

		it('should return the pre-registered version of a service when a pre-registered service is available', function() {
			assert.deepEqual(testServiceProvider.getService('service3'), preRegisteredService3);
		});

		it('should return the same pre-registered service instance when called multiple times', function() {
			assert.deepEqual(testServiceProvider.getService('service3'), preRegisteredService3);
			assert.strictEqual(testServiceProvider.getService('service3'), testServiceProvider.getService('service3'));
		});

		it('should throw an error when service is not available and service is on the allowedServiceList', function() {
			assert.throws(function() {
				testServiceProvider.getService('service4');
			}, 'Service "not-available-service" does not exist.');
		});

		it('should throw an error when service is not available and service is not on the allowedServiceList', function() {
			assert.throws(function() {
				testServiceProvider.getService('not-available-service');
			}, 'Service "not-available-service" is not on the `allowedServiceList`. Use "new Box.TestServiceProvider({ ...stubs... }, [\'not-available-service\']);" or stub the service out.');
		});

	});

	describe('hasService()', function() {

		beforeEach(function() {
			// Setup Application
			var hasServiceStub = sandbox.stub(Box.Application, 'hasService');
			hasServiceStub.withArgs('service2').returns(true);
			hasServiceStub.withArgs('service4').returns(true);
			hasServiceStub.returns(false);

			testServiceProvider = new Box.TestServiceProvider({
				service1: {}
			}, ['service2', 'service3']);
		});

		it('should return false when service does not exist', function() {
			assert.isFalse(testServiceProvider.hasService('non-existent-service'));
		});

		it('should return true when service is stubbed', function() {
			assert.isTrue(testServiceProvider.hasService('service1'));
		});

		it('should return true when service is allowed and available', function() {
			assert.isTrue(testServiceProvider.hasService('service2'));
		});

		it('should return false when service is allowed but not available', function() {
			assert.isFalse(testServiceProvider.hasService('service3'));
		});

		it('should return false when service is available but not allowed', function() {
			assert.isFalse(testServiceProvider.hasService('service4'));
		});

	});

	describe('getGlobal()', function() {

		it('should return window var when requesting an existing property', function() {
			window.foo = 'bar';
			assert.strictEqual(testServiceProvider.getGlobal('foo'), window.foo);
			delete window.foo;
		});

		it('should return null when requesting a non-existent property', function() {
			assert.isNull(testServiceProvider.getGlobal('foobar'));
		});

	});
});
