/**
 * @fileoverview Tests for application core
 * @author Box
 */

'use strict';

var proxyquire = require('proxyquire');

describe('application', function() {

	var sandbox = sinon.sandbox.create();

	var testModule,
		testModule2,
		nestedModule,
		application;

	before(function() {
		var fixture = document.createElement('div');
		fixture.id = 'mocha-fixture';
		document.body.appendChild(fixture);
	});

	beforeEach(function() {
		// Stub out Context so it doesn't interfere with the test
		application = proxyquire('../lib/application', {
			'./context': sandbox.stub()
		});
	});

	afterEach(function () {
		sandbox.verifyAndRestore();

		$('#mocha-fixture').empty();

		// Always destroy application after a test - clears out registered components
		application.destroy();
	});

	after(function() {
		$('#mocha-fixture').remove();
	});

	describe('init()', function() {

		it('should pass <html> element to startAll', function() {
			sandbox.mock(application).expects('startAll').withArgs(document.documentElement);
			application.init();
		});

	});

	describe('destroy()', function() {

		it('should pass <html> element to stopAll', function() {
			sandbox.mock(application).expects('stopAll').withArgs(document.documentElement);
			application.destroy();
		});

	});

	describe('isStarted()', function() {

		beforeEach(function() {
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			$('#mocha-fixture').append(testModule);
		});

		it('should return true when module is started', function() {
			application.addModule('test', sandbox.stub().returns({}));
			application.start(testModule);
			assert.ok(application.isStarted(testModule), 'Module should be started');
		});

		it('should return false when module is stopped', function() {
			application.addModule('test', sandbox.stub().returns({}));
			application.start(testModule);
			application.stop(testModule);
			assert.notOk(application.isStarted(testModule), 'Module should not be started');
		});

		it('should return false when module has not been started yet', function() {
			application.addModule('test', sandbox.stub().returns({}));
			assert.notOk(application.isStarted(testModule), 'Module should not be started');
		});

	});

	describe('start()', function() {

		beforeEach(function() {
			application.init();
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			testModule2 = $('<div data-module="test" />')[0];
			$('#mocha-fixture').append(testModule, testModule2);
		});

		it('should create a new module when called with an HTML element with data-module', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(testModule);
			assert.ok(application.isStarted(testModule), 'module started');
		});

		it('should generate different IDs for modules when two modules of the same type are started', function() {
			application.addModule('test', sandbox.mock().twice().returns({}));
			application.start(testModule);
			application.start(testModule2);
			assert.equal(testModule.id, 'mod-test-1', 'First module ID should be set');
			assert.equal(testModule2.id, 'mod-test-2', 'Second module ID should be set');
		});

		it('should call init() on a new module when called with an HTML element with data-module', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
				init: sandbox.mock()
			}));
			application.start(testModule);
		});

		it('should call init() on module and behaviors in order they are defined when called', function() {
			var moduleInitSpy = sandbox.spy(),
				behaviorInitSpy = sandbox.spy(),
				behavior2InitSpy = sandbox.spy();

			application.addModule('test', sandbox.stub().returns({
				behaviors: ['test-behavior', 'test-behavior2'],
				init: moduleInitSpy
			}));
			application.addBehavior('test-behavior', sandbox.stub().returns({
				init: behaviorInitSpy
			}));
			application.addBehavior('test-behavior2', sandbox.stub().returns({
				init: behavior2InitSpy
			}));
			application.start(testModule);

			assert.ok(moduleInitSpy.calledBefore(behaviorInitSpy), 'module init called before first behavior init');
			assert.ok(behaviorInitSpy.calledBefore(behavior2InitSpy), 'first behavior init called before second behavior init');
		});

		it('should emit an error event when not in debug mode', function() {
			var exception = new Error('Something bad happened.');

			application.addModule('test', sandbox.stub().returns({
				init: sandbox.stub().throws(exception)
			}));
			var mock = sandbox.mock().withArgs(sinon.match({
				type: 'error',
				data: sinon.match({
					exception: sinon.match({
						name: 'test.init() - Error',
						message: 'test.init() - Something bad happened.'
					})
				})
			}));

			application.on('error', mock);
			application.start(testModule);
			application.off('error', mock);
		});

		it('should emit an error when a module specifies a behavior that does not exist', function() {
			application.addModule('test', sandbox.stub().returns({
				behaviors: ['test-behavior']
			}));

			// Using atLeast(1) since both bindEventListeners and the init loop call getBehaviors twice
			var mock = sandbox.mock().atLeast(1).withArgs(sinon.match({
				type: 'error',
				data: sinon.match({
					exception: new Error('Behavior "test-behavior" not found')
				})
			}));

			application.on('error', mock);
			application.start(testModule);
			application.off('error', mock);
		});

	});

	describe('start() - debug mode', function() {

		beforeEach(function() {
			application.init({ debug: true });
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			$('#mocha-fixture').append(testModule);
		});

		it('should rethrow an error in the module init() when in debug mode', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
				init: sandbox.stub().throws('Something bad happened.')
			}));

			assert.throws(function() {
				application.start(testModule);
			}, 'test.init() - Something bad happened.');
		});

		it('should raise an error when no matching module has been registered', function() {
			assert.throws(function() {
				application.start(testModule);
			}, /Module type "test" is not defined/);
		});

	});

	describe('stop()', function() {

		beforeEach(function() {
			application.init();
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			$('#mocha-fixture').append(testModule);
		});

		it('stop stops a module when called with an HTML element with data-module', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(testModule);
			application.stop(testModule);
			assert.notOk(application.isStarted(testModule), 'Module should be stopped');
		});

		it('stop calls destroy() on a module when called with an HTML element with data-module', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
				destroy: sandbox.mock()
			}));
			application.start(testModule);
			application.stop(testModule);
		});

		it('stop calls destroy() on module and behaviors in reverse order when called', function() {
			var moduleDestroySpy = sandbox.spy(),
				behaviorDestroySpy = sandbox.spy(),
				behavior2DestroySpy = sandbox.spy();

			application.addModule('test', sandbox.stub().returns({
				behaviors: ['test-behavior', 'test-behavior2'],
				destroy: moduleDestroySpy
			}));
			application.addBehavior('test-behavior', sandbox.stub().returns({
				destroy: behaviorDestroySpy
			}));
			application.addBehavior('test-behavior2', sandbox.stub().returns({
				destroy: behavior2DestroySpy
			}));
			application.start(testModule);
			application.stop(testModule);

			assert.ok(behavior2DestroySpy.calledBefore(behaviorDestroySpy), 'second behavior destroy called before first behavior destroy');
			assert.ok(behaviorDestroySpy.calledBefore(moduleDestroySpy), 'first behavior destroy called before module destroy');
		});

	});

	describe('startAll()', function() {

		beforeEach(function() {
			application.init();
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
			$('#mocha-fixture').append(testModule, nestedModule);
		});

		it('startAll starts a child module when called with nested modules', function() {
			application.addModule('parent', sandbox.mock().never());
			application.addModule('child', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.startAll(nestedModule);

			assert.notOk(application.isStarted(nestedModule), 'Parent module should not be started');
			assert.ok(application.isStarted(nestedModule.children[0]), 'Child module should be started');
		});
	});

	describe('stopAll()', function() {

		beforeEach(function() {
			application.init();
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
			$('#mocha-fixture').append(testModule, nestedModule);
		});

		it('stopAll stops nested module', function() {
			application.addModule('child', sandbox.stub().returns({}));

			application.startAll(nestedModule);
			application.stopAll(nestedModule);

			assert.notOk(application.isStarted(nestedModule.children[0]), 'child module stopped');
		});

	});

	describe('addService()', function() {

		it('should throw an error when adding a service that already exists', function() {
			application.addService('some-service', sandbox.stub().returns({}));

			application.init({
				debug: true
			});

			assert.throws(function() {
				application.addService('some-service', sandbox.stub().returns({}));
			});
		});

		it('should register methods on Application when passed multiple exports', function() {
			application.addService('test', sandbox.stub().returns({
				foo: sandbox.mock().returns(1),
				bar: sandbox.mock().returns(2)
			}), {
				exports: ['foo', 'bar']
			});

			assert.equal(application.foo(), 1);
			assert.equal(application.bar(), 2);
		});

		it('should register methods on the context object when passed multiple exports', function() {
			testModule = $('<div data-module="test"><span id="module-target" data-type="target"></span></div>')[0];
			$('#mocha-fixture').append(testModule);

			application.addService('test', sandbox.stub().returns({
				foo: sandbox.mock().returns(1),
				bar: sandbox.mock().returns(2)
			}), {
				exports: ['foo', 'bar']
			});

			application.addModule('test', function(context) {
				return {
					init: function() {
						assert.equal(context.foo(), 1);
						assert.equal(context.bar(), 2);
					}
				};
			});

			application.start(testModule);
		});

		it('should throw an error when an extension already exists', function() {
			application.init({
				debug: true
			});

			application.addService('test', sandbox.stub().returns({
				foo: function() {}
			}), {
				exports: ['foo']
			});

			assert.throws(function() {
				application.addService('test2', sandbox.stub().returns({
					foo: function() {}
				}), {
					exports: ['foo']
				});
			});
		});

		it('should throw an error when the service name already exists', function() {
			application.init({
				debug: true
			});

			application.addService('test', sandbox.stub().returns({}));

			assert.throws(function() {
				application.addService('test', sandbox.stub().returns({}));
			});
		});

	});

	describe('addModule()', function() {

		beforeEach(function() {
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			$('#mocha-fixture').append(testModule);
		});

		it('should throw an error when adding a module that already exists', function() {
			application.addModule('test', sandbox.stub().returns({}));

			application.init({
				debug: true
			});

			assert.throws(function() {
				application.addModule('test', sandbox.stub().returns({}));
			});
		});

	});

	describe('addBehavior()', function() {

		it('should throw an error when adding a behavior that already exists', function() {
			application.addModule('test', sandbox.stub().returns({}));
			application.addBehavior('some-behavior', sandbox.stub().returns({}));

			application.init({
				debug: true
			});

			assert.throws(function() {
				application.addBehavior('some-behavior', sandbox.stub().returns({}));
			});
		});

	});

	describe('getService()', function() {

		it('should call the creator function with application as an argument when called for an existing service', function() {
			application.addService('test', sandbox.mock().withExactArgs(application));
			application.getService('test');
		});

		it('should call the creator function with application as an argument when called for two services', function() {
			application.addService('test', sandbox.mock().withExactArgs(application));
			application.getService('test');
			application.addService('test2', sandbox.mock().withExactArgs(application));
			application.getService('test2');
		});

		it('should return the object that is returned from the creator function when called for an existing service', function() {
			var testService = {};

			application.addService('test', sandbox.stub().returns(testService));

			assert.equal(application.getService('test'), testService, 'constructed service returned');
		});

		it('should return the same object for each call when called for the same service multiple times', function() {
			application.addService('test', sandbox.mock().once().returns({}));

			var first = application.getService('test');
			var second = application.getService('test');
			assert.equal(first, second, 'same service returned');
		});

		it('should return null when called for a non-existing service', function() {
			var service = application.getService('test');
			assert.equal(service, null, 'null returned');
		});

		it('should throw an error when a circular dependency exists between services', function() {
			application.init({
				debug: true
			});

			application.addService('test', function(application) {
				return application.getService('test2');
			});
			application.addService('test2', function(application) {
				return application.getService('test');
			});

			assert.throws(function() {
				application.getService('test');
			}, /Circular service dependency: test -> test2 -> test/);
		});

	});

	describe('on[event]()', function() {

		beforeEach(function() {
			application.init();

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			testModule = $('<div data-module="test"><span id="module-target" data-type="target"></span></div>')[0];
			nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
			$('#mocha-fixture').append(testModule, nestedModule);
		});

		it('should be called when an event occurs inside of a started module', function() {
			application.addModule('test', sandbox.stub().returns({
				onclick: sandbox.mock()
			}));

			application.start(testModule);

			$('#module-target').trigger({
				type: 'click',
				button: 1
			});
		});

		it('should be called on behaviors in correct order when defined', function() {

			var moduleClickSpy = sandbox.spy(),
				behaviorClickSpy = sandbox.spy(),
				behavior2ClickSpy = sandbox.spy();

			application.addModule('test', sandbox.stub().returns({
				behaviors: ['test-behavior', 'test-behavior2'],
				onclick: moduleClickSpy
			}));

			application.addBehavior('test-behavior', sandbox.stub().returns({
				onclick: behaviorClickSpy
			}));
			application.addBehavior('test-behavior2', sandbox.stub().returns({
				onclick: behavior2ClickSpy
			}));

			application.start(testModule);

			$('#module-target').trigger({
				type: 'click',
				button: 1
			});

			assert.ok(moduleClickSpy.calledBefore(behaviorClickSpy), 'module called before first behavior');
			assert.ok(behaviorClickSpy.calledBefore(behavior2ClickSpy), 'first behavior called before second behavior');

		});

		it('should be called with the nearest type element and type when an event occurs inside of a started module', function() {

			application.addModule('test', sandbox.stub().returns({
				onclick: sandbox.mock().withArgs(sinon.match.any, $('#module-target')[0], $('#module-target').data('type'))
			}));

			application.start(testModule);

			$('#module-target').trigger({
				type: 'click',
				button: 1
			});

		});

		it('should not be passed element when nearest data-type element is outside module scope', function() {

			var moduleWithDataTypeOutside = $('<div data-type="something"><div data-module="child"><button id="inner-btn">button</button></div></div>')[0];
			$('#mocha-fixture').append(moduleWithDataTypeOutside);

			application.setGlobalConfig({
				debug: true
			});

			application.addModule('child', sandbox.stub().returns({
				onclick: sandbox.mock().withArgs(sinon.match.any, null, '')
			}));

			application.start(moduleWithDataTypeOutside.firstChild);

			$('#inner-btn').trigger({
				type: 'click',
				button: 1
			});

		});

		it('should not be called when an event occurs inside of a stopped module', function() {

			application.addModule('test', sandbox.stub().returns({
				onclick: sandbox.mock().never()
			}));

			application.start(testModule);
			application.stop(testModule);

			$('#module-target').trigger({
				type: 'click',
				button: 1
			});

		});


	});


	describe('broadcast()', function() {

		beforeEach(function() {
			application.init();

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			testModule2 = $('<div data-module="test2" />')[0];
			$('#mocha-fixture').append(testModule, testModule2);
		});

		it('should call onmessage of modules listening for the specific message when called', function() {
			var messageData = {};

			application.addModule('test', sandbox.stub().returns({
				messages: ['abc'],
				onmessage: sandbox.mock().withArgs('abc', messageData)
			}));
			application.addModule('test2', sandbox.stub().returns({
				messages: ['abc'],
				onmessage: sandbox.mock().withArgs('abc', messageData)
			}));
			application.start(testModule);
			application.start(testModule2);

			application.broadcast('abc', messageData);
		});

		it('should call onmessage of behaviors listening in correct order when defined', function() {
			var messageData = {},
				moduleMessageSpy = sandbox.spy(),
				behaviorMessageSpy = sandbox.spy(),
				behavior2MessageSpy = sandbox.spy();

			application.addModule('test', sandbox.stub().returns({
				behaviors: ['test-behavior', 'test-behavior2'],
				messages: ['abc'],
				onmessage: moduleMessageSpy
			}));
			application.addBehavior('test-behavior', sandbox.stub().returns({
				messages: ['abc'],
				onmessage: behaviorMessageSpy
			}));
			application.addBehavior('test-behavior2', sandbox.stub().returns({
				messages: ['abc'],
				onmessage: behavior2MessageSpy
			}));

			application.start(testModule);

			application.broadcast('abc', messageData);

			assert.ok(moduleMessageSpy.calledWith('abc', messageData));
			assert.ok(behaviorMessageSpy.calledWith('abc', messageData));
			assert.ok(behavior2MessageSpy.calledWith('abc', messageData));
			assert.ok(moduleMessageSpy.calledBefore(behaviorMessageSpy), 'module called before first behavior');
			assert.ok(behaviorMessageSpy.calledBefore(behavior2MessageSpy), 'first behavior called before second behavior');
		});


		it('should not call onmessage of a module when the module is stopped and the message is broadcast', function() {
			application.addModule('test', sandbox.stub().returns({
				messages: ['abc'],
				onmessage: sandbox.mock().never()
			}));
			application.start(testModule);
			application.stop(testModule);

			application.broadcast('abc');
		});

	});


	describe('getModuleConfig()', function() {

		var moduleWithConfig;

		beforeEach(function() {
			testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
			moduleWithConfig = $('<div data-module="test"><script type="text/x-config">{"name":"box"}</script></div>')[0];

			$('#mocha-fixture').append(testModule, moduleWithConfig);
		});

		it('should return null when the module has no configuration', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(testModule);

			var config = application.getModuleConfig(testModule);
			assert.strictEqual(config, null, 'Configuration should be null.');
		});

		it('should return an object when the module has configuration', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(moduleWithConfig);

			var config = application.getModuleConfig(moduleWithConfig);
			assert.deepEqual(config, { name: 'box' }, 'Configuration key name should be "box".');
		});

		it('should return config value when name specified', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(moduleWithConfig);

			var config = application.getModuleConfig(moduleWithConfig, 'name');
			assert.equal(config, 'box', 'Configuration value should be returned');
		});

		it('should return null when config key does not exist', function() {
			application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
			application.start(moduleWithConfig);

			var config = application.getModuleConfig(moduleWithConfig, 'abc');
			assert.strictEqual(config, null, 'null should be returned');
		});

	});

	describe('getGlobal', function() {

		it('should return the window-scope var when it exists', function() {
			window.foo = 'bar';
			assert.strictEqual(application.getGlobal('foo'), 'bar', 'global var returned');

			// @NOTE(nzakas): IE8 doesn't like delete here
			window.foo = null;
		});

		it('should return the null when global var does not exist', function() {
			assert.strictEqual(application.getGlobal('nonexistent'), null, 'null returned');
		});

	});


	describe('getGlobalConfig()', function() {

		beforeEach(function() {
			application.init({
				foo: 'bar'
			});
		});

		it('should return the full config when called without parameters', function() {
			// won't be same object but will have same contents
			assert.deepEqual(application.getGlobalConfig(), { foo: 'bar' }, 'full config returned');
		});

		it('should return value when it was set during initialization', function() {
			assert.equal(application.getGlobalConfig('foo'), 'bar', 'config value returned');
		});

		it('should not return value when it was not set during initialization', function() {
			assert.strictEqual(application.getGlobalConfig('bar'), null, 'missing config value returns null');
		});

	});


	describe('setGlobalConfig()', function() {

		it('should set the globalConfig object', function() {
			application.setGlobalConfig({
				foo: 'bar'
			});

			assert.equal(application.getGlobalConfig('foo'), 'bar', 'config value is set');
		});

		it('should throw an error after application initialization', function() {
			application.init({
				debug: true
			});

			assert.throws(function() {
				application.setGlobalConfig({
					foo: 'bar'
				});
			});
		});

		it('should have globalConfig overriden by application initialization', function() {
			application.setGlobalConfig({
				theAnswer: 12
			});

			application.init({
				theAnswer: 42
			});

			assert.equal(application.getGlobalConfig('theAnswer'), 42, 'config value is set by init');
		});

	});

});
