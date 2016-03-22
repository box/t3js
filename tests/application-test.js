/**
 * @fileoverview Tests for application core
 * @author Box
 */

describe('Box.Application', function() {

	'use strict';

	leche.withData({
		native: [Box.NativeDOM],
		jquery: [Box.JQueryDOM]
	}, function(dom) {

		var sandbox = sinon.sandbox.create();

		var testModule,
			testModule2,
			testTarget,
			nestedModule;

		before(function() {
			Box.DOM = dom;
			var fixture = document.createElement('div');
			fixture.id = 'mocha-fixture';
			document.body.appendChild(fixture);
		});

		beforeEach(function() {
			// stub out Context so it doesn't interfere with the test
			sandbox.stub(Box, 'Context');
		});

		afterEach(function () {
			sandbox.verifyAndRestore();

			$('#mocha-fixture').empty();

			// Always destroy application after a test - clears out registered components
			Box.Application.destroy();
		});

		after(function() {
			$('#mocha-fixture').remove();
		});

		describe('init()', function() {

			it('should pass <html> element to startAll', function() {
				sandbox.mock(Box.Application).expects('startAll').withArgs(document.documentElement);
				Box.Application.init();
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.init();
				assert.equal(result, Box.Application);
			});

		});

		describe('destroy()', function() {

			it('should pass <html> element to stopAll', function() {
				sandbox.mock(Box.Application).expects('stopAll').withArgs(document.documentElement);
				Box.Application.destroy();
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.destroy();
				assert.equal(result, Box.Application);
			});
		});

		describe('isStarted()', function() {

			beforeEach(function() {
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				$('#mocha-fixture').append(testModule);
			});

			it('should return true when module is started', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				Box.Application.start(testModule);
				assert.ok(Box.Application.isStarted(testModule), 'Module should be started');
			});

			it('should return false when module is stopped', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				Box.Application.start(testModule);
				Box.Application.stop(testModule);
				assert.notOk(Box.Application.isStarted(testModule), 'Module should not be started');
			});

			it('should return false when module has not been started yet', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				assert.notOk(Box.Application.isStarted(testModule), 'Module should not be started');
			});

		});

		describe('start()', function() {

			beforeEach(function() {
				Box.Application.init();
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				testModule2 = $('<div data-module="test" />')[0];
				$('#mocha-fixture').append(testModule, testModule2);
			});

			it('should return Box.Application when called', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				var result = Box.Application.start(testModule);
				assert.equal(result, Box.Application);
			});

			it('should create a new module when called with an HTML element with data-module', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(testModule);
			});

			it('should generate different IDs for modules when two modules of the same type are started', function() {
				Box.Application.addModule('test', sandbox.mock().twice().returns({}));
				Box.Application.start(testModule);
				Box.Application.start(testModule2);
				assert.equal(testModule.id, 'mod-test-1', 'First module ID should be set');
				assert.equal(testModule2.id, 'mod-test-2', 'Second module ID should be set');
			});

			it('should call init() on a new module when called with an HTML element with data-module', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
					init: sandbox.mock()
				}));
				Box.Application.start(testModule);
			});

			it('should call init() on module before binding event handlers when called', function() {
				Box.Application.addModule('test', function() {
					return {
						init: function() {
							document.getElementById('module-target').click();
						},
						onclick: sandbox.mock().never()
					};
				});
				Box.Application.start(testModule);
			});

			it('should bind event handlers with globalConfig.eventTypes when called', function() {
				var eventTypes = ['touchstart'];
				Box.Application.init({
					eventTypes: eventTypes
				});

				var domEventDelegateSpy = sandbox.spy(Box, 'DOMEventDelegate');
				Box.Application.addModule('test', function() {
					return {};
				});

				Box.Application.start(testModule);

				assert.deepEqual(domEventDelegateSpy.getCall(0).args[2], eventTypes);

				domEventDelegateSpy.restore();
			});

			it('should call init() behaviors in order they are defined and then the module when called', function() {
				var moduleInitSpy = sandbox.spy(),
					behaviorInitSpy = sandbox.spy(),
					behavior2InitSpy = sandbox.spy();

				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior', 'test-behavior2'],
					init: moduleInitSpy
				}));
				Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
					init: behaviorInitSpy
				}));
				Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
					init: behavior2InitSpy
				}));
				Box.Application.start(testModule);

				assert.ok(behaviorInitSpy.calledBefore(behavior2InitSpy), 'first behavior init called before second behavior init');
				assert.ok(behavior2InitSpy.calledBefore(moduleInitSpy), 'module init called after second behavior init');

			});

			it('should emit an error event when not in debug mode', function() {
				var exception = new Error('Something bad happened.');

				Box.Application.addModule('test', sandbox.stub().returns({
					init: sandbox.stub().throws(exception)
				}));
				var mock = sandbox.mock().withArgs(sinon.match({
					type: 'error',
					data: sinon.match({
						exception: sinon.match({
							name: 'test.init() - Error',
							message: 'test.init() - Something bad happened.',
							methodName: 'init',
							objectName: 'test'
						})
					})
				}));

				Box.Application.on('error', mock);
				Box.Application.start(testModule);
				Box.Application.off('error', mock);
			});

			it('should emit an error when a module specifies a behavior that does not exist', function() {
				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior']
				}));

				// Using atLeast(1) since both bindEventListeners and the init loop call getBehaviors twice
				var mock = sandbox.mock().atLeast(1).withArgs(sinon.match({
					type: 'error',
					data: sinon.match({
						exception: new Error('Behavior "test-behavior" not found')
					})
				}));

				Box.Application.on('error', mock);
				Box.Application.start(testModule);
				Box.Application.off('error', mock);
			});

			it('should emit an error when a module specifies a behavior twice', function() {
				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior', 'test-behavior']
				}));
				Box.Application.addBehavior('test-behavior', sandbox.stub().returns({}));

				// Using atLeast(1) since both bindEventListeners and the init loop call getBehaviors twice
				var mock = sandbox.mock().atLeast(1).withArgs(sinon.match({
					type: 'error',
					data: sinon.match({
						exception: new Error('Behavior "test-behavior" cannot be specified twice in a module.')
					})
				}));

				Box.Application.on('error', mock);
				Box.Application.start(testModule);
				Box.Application.off('error', mock);
			});

		});

		describe('start() - debug mode', function() {

			beforeEach(function() {
				Box.Application.init({ debug: true });
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				$('#mocha-fixture').append(testModule);
			});

			it('should rethrow an error in the module init() when in debug mode', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
					init: sandbox.stub().throws('Something bad happened.')
				}));

				assert.throws(function() {
					Box.Application.start(testModule);
				}, 'test.init() - Something bad happened.');
			});

			it('should raise an error when no matching module has been registered', function() {
				assert.throws(function() {
					Box.Application.start(testModule);
				}, /Module type "test" is not defined/);
			});

		});

		describe('stop()', function() {

			beforeEach(function() {
				Box.Application.init();
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				$('#mocha-fixture').append(testModule);
			});

			it('stop stops a module when called with an HTML element with data-module', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(testModule);
				Box.Application.stop(testModule);
				assert.notOk(Box.Application.isStarted(testModule), 'Module should be stopped');
			});

			it('stop calls destroy() on a module when called with an HTML element with data-module', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({
					destroy: sandbox.mock()
				}));
				Box.Application.start(testModule);
				Box.Application.stop(testModule);
			});

			it('should return Box.Application when called', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				Box.Application.start(testModule);
				var result = Box.Application.stop(testModule);
				assert.equal(result, Box.Application);
			});

			it('stop calls destroy() on module and behaviors in reverse order when called', function() {
				var moduleDestroySpy = sandbox.spy(),
					behaviorDestroySpy = sandbox.spy(),
					behavior2DestroySpy = sandbox.spy();

				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior', 'test-behavior2'],
					destroy: moduleDestroySpy
				}));
				Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
					destroy: behaviorDestroySpy
				}));
				Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
					destroy: behavior2DestroySpy
				}));
				Box.Application.start(testModule);
				Box.Application.stop(testModule);

				assert.ok(behavior2DestroySpy.calledBefore(behaviorDestroySpy), 'second behavior destroy called before first behavior destroy');
				assert.ok(behaviorDestroySpy.calledBefore(moduleDestroySpy), 'first behavior destroy called before module destroy');
			});

		});

		describe('startAll()', function() {

			beforeEach(function() {
				Box.Application.init();
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
				$('#mocha-fixture').append(testModule, nestedModule);
			});

			it('startAll starts a child module when called with nested modules', function() {

				Box.Application.addModule('parent', sandbox.mock().never());
				Box.Application.addModule('child', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.startAll(nestedModule);

				assert.notOk(Box.Application.isStarted(nestedModule), 'Parent module should not be started');
				assert.ok(Box.Application.isStarted(nestedModule.children[0]), 'Child module should be started');
			});

			it('should return Box.Application when called', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				var result = Box.Application.startAll(testModule);
				assert.equal(result, Box.Application);
			});

		});

		describe('stopAll()', function() {

			beforeEach(function() {
				Box.Application.init();
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
				$('#mocha-fixture').append(testModule, nestedModule);
			});

			it('stopAll stops nested module', function() {
				Box.Application.addModule('child', sandbox.stub().returns({}));

				Box.Application.startAll(nestedModule);
				Box.Application.stopAll(nestedModule);

				assert.notOk(Box.Application.isStarted(nestedModule.children[0]), 'child module stopped');
			});

			it('should return Box.Application when called', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				Box.Application.startAll(testModule);
				var result = Box.Application.stopAll(testModule);
				assert.equal(result, Box.Application);
			});

		});

		describe('addService()', function() {

			beforeEach(function(){
				Box.Application.destroy();
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.addService('some-service', sandbox.stub().returns({}));
				assert.equal(result, Box.Application);
			});

			it('should throw an error when adding a service that already exists', function() {
				Box.Application.addService('some-service', sandbox.stub().returns({}));

				Box.Application.init({
					debug: true
				});

				assert.throws(function() {
					Box.Application.addService('some-service', sandbox.stub().returns({}));
				});
			});

			it('should throw an error when the service name already exists', function() {
				Box.Application.init({
					debug: true
				});

				Box.Application.addService('test', sandbox.stub().returns({}));

				assert.throws(function() {
					Box.Application.addService('test', sandbox.stub().returns({}));
				});
			});

		});

		describe('addModule()', function() {

			beforeEach(function() {
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				$('#mocha-fixture').append(testModule);
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.addModule('some-module', sandbox.stub().returns({}));
				assert.equal(result, Box.Application);
			});

			it('should throw an error when adding a module that already exists', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));

				Box.Application.init({
					debug: true
				});

				assert.throws(function() {
					Box.Application.addModule('test', sandbox.stub().returns({}));
				});
			});

		});

		describe('addBehavior()', function() {

			it('should return Box.Application when called', function() {
				var result = Box.Application.addBehavior('some-behavior', sandbox.stub().returns({}));
				assert.equal(result, Box.Application);
			});


			it('should throw an error when adding a behavior that already exists', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));
				Box.Application.addBehavior('some-behavior', sandbox.stub().returns({}));

				Box.Application.init({
					debug: true
				});

				assert.throws(function() {
					Box.Application.addBehavior('some-behavior', sandbox.stub().returns({}));
				});
			});

		});

		describe('getService()', function() {

			it('should call the creator function with application as an argument when called for an existing service', function() {
				Box.Application.addService('test', sandbox.mock().withExactArgs(Box.Application));
				Box.Application.getService('test');
			});

			it('should call the creator function with application as an argument when called for two services', function() {
				Box.Application.addService('test', sandbox.mock().withExactArgs(Box.Application));
				Box.Application.getService('test');
				Box.Application.addService('test2', sandbox.mock().withExactArgs(Box.Application));
				Box.Application.getService('test2');
			});

			it('should return the object that is returned from the creator function when called for an existing service', function() {
				var testService = {};

				Box.Application.addService('test', sandbox.stub().returns(testService));

				assert.equal(Box.Application.getService('test'), testService, 'constructed service returned');
			});

			it('should return the same object for each call when called for the same service multiple times', function() {
				Box.Application.addService('test', sandbox.mock().once().returns({}));

				var first = Box.Application.getService('test');
				var second = Box.Application.getService('test');
				assert.equal(first, second, 'same service returned');
			});

			it('should return null when called for a non-existing service (debug off)', function() {
				var service = Box.Application.getService('test');

				assert.equal(service, null, 'null returned');
			});

			it('should fire an error when called for a non-existing service (debug off)', function() {
				var errorHandlerMock = sandbox.mock();

				Box.Application.on('error', errorHandlerMock);

				Box.Application.getService('test');

				Box.Application.off('error', errorHandlerMock);
			});

			it('should throw an error when called for a non-existing service (debug on)', function() {
				Box.Application.init({
					debug: true
				});
				assert.throws(function() {
					Box.Application.getService('test');
				}, /Service "test" not found/);
			});

			it('should throw an error when a circular dependency exists between services', function() {
				Box.Application.init({
					debug: true
				});

				Box.Application.addService('test', function(application) {
					return application.getService('test2');
				});
				Box.Application.addService('test2', function(application) {
					return application.getService('test');
				});

				assert.throws(function() {
					Box.Application.getService('test');
				}, /Circular service dependency: test -> test2 -> test/);
			});

		});

		describe('hasService()', function() {

			it('should return true when the service exists', function() {
				Box.Application.addService('test', function() {});
				assert.isTrue(Box.Application.hasService('test'));
			});

			it('should return false when the service does not exist', function() {
				assert.isFalse(Box.Application.hasService('test'));
			});

		});

		describe('on[event]()', function() {


			beforeEach(function() {
				Box.Application.init();

				// add after init() to ensure we won't have errors due to missing
				// module definitions
				testModule = $('<div data-module="test"><button id="module-target" data-type="target"></button></div>')[0];
				nestedModule = $('<div data-module="parent"><div data-module="child"></div></div>')[0];
				$('#mocha-fixture').append(testModule, nestedModule);
				testTarget = document.getElementById('module-target');
			});

			it('should be called when an event occurs inside of a started module', function() {
				Box.Application.addModule('test', sandbox.stub().returns({
					onclick: sandbox.mock()
				}));

				Box.Application.start(testModule);

				testTarget.click();
			});

			it('should still be called with a null element when an event occurs on a recently detached element', function() {
				// Background on this edge case:
				//	1. event handlers like mouseout may sometimes detach nodes from the DOM
				//	2. event handlers like mouseleave will still fire on the detached node
				// Without checking the existence of a parentNode and returning null, we would throw errors

				// Scenario appears unique to jquery
				if (Box.DOM.type === 'jquery') {
					Box.Application.addModule('test', sandbox.stub().returns({
						onclick: sandbox.mock().withArgs(sinon.match.any, null)
					}));

					Box.Application.start(testModule);

					$('#module-target').trigger({
						type: 'click',
						target: document.createElement('div') // Detached node
					});
				}
			});

			it('should be called on behaviors in correct order when defined', function() {

				var moduleClickSpy = sandbox.spy(),
					behaviorClickSpy = sandbox.spy(),
					behavior2ClickSpy = sandbox.spy();

				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior', 'test-behavior2'],
					onclick: moduleClickSpy
				}));

				Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
					onclick: behaviorClickSpy
				}));
				Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
					onclick: behavior2ClickSpy
				}));

				Box.Application.start(testModule);

				testTarget.click();

				assert.ok(moduleClickSpy.calledBefore(behaviorClickSpy), 'module called before first behavior');
				assert.ok(behaviorClickSpy.calledBefore(behavior2ClickSpy), 'first behavior called before second behavior');

			});


			it('should not be called on behaviors when stopImmediatePropagation() is called', function() {

				// Can only test using jQuery because stopImmediatePropagation() doesn't exist in IE8

				if (Box.DOM.type === 'jquery') {

					Box.Application.addModule('test', sandbox.stub().returns({
						behaviors: ['test-behavior', 'test-behavior2'],
						onclick: function(event) {
							event.stopImmediatePropagation();
						}
					}));

					Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
						onclick: sandbox.mock().never()
					}));
					Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
						onclick: sandbox.mock().never()
					}));

					Box.Application.start(testModule);

					testTarget.click();
				}

			});

			it('should not be called on secondary behavior when stopImmediatePropagation() is called in first behavior', function() {

				// Can only test using jQuery because stopImmediatePropagation() doesn't exist in IE8

				if (Box.DOM.type === 'jquery') {

					Box.Application.addModule('test', sandbox.stub().returns({
						behaviors: ['test-behavior', 'test-behavior2'],
						onclick: sandbox.stub()
					}));

					Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
						onclick: function(event) {
							event.stopImmediatePropagation();
						}
					}));

					Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
						onclick: sandbox.mock().never()
					}));

					Box.Application.start(testModule);

					testTarget.click();
				}

			});


			it('should be called with the nearest type element and type when an event occurs inside of a started module', function() {

				Box.Application.addModule('test', sandbox.stub().returns({
					onclick: sandbox.mock().withArgs(sinon.match.any, $('#module-target')[0], $('#module-target').data('type'))
				}));

				Box.Application.start(testModule);

				testTarget.click();

			});

			it('should not be passed element when nearest data-type element is outside module scope', function() {

				var moduleWithDataTypeOutside = $('<div data-type="something"><div data-module="child"><button id="inner-btn">button</button></div></div>')[0];
				$('#mocha-fixture').append(moduleWithDataTypeOutside);

				Box.Application.setGlobalConfig({
					debug: true
				});

				Box.Application.addModule('child', sandbox.stub().returns({
					onclick: sandbox.mock().withArgs(sinon.match.any, null, '')
				}));

				Box.Application.start(moduleWithDataTypeOutside.firstChild);

				document.getElementById('inner-btn').click();

			});

			it('should not be called when an event occurs inside of a stopped module', function() {

				Box.Application.addModule('test', sandbox.stub().returns({
					onclick: sandbox.mock().never()
				}));

				Box.Application.start(testModule);
				Box.Application.stop(testModule);

				testTarget.click();
			});



		});

		describe('broadcast()', function() {

			var eventHandlerMock;

			beforeEach(function() {
				Box.Application.init();

				// add after init() to ensure we won't have errors due to missing
				// module definitions
				testModule = $('<div data-module="test"><span id="module-target"></span></div>')[0];
				testModule2 = $('<div data-module="test2" />')[0];
				$('#mocha-fixture').append(testModule, testModule2);
			});

			afterEach(function() {
				if (eventHandlerMock) {
					Box.Application.off('message', eventHandlerMock);
				}
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.broadcast('abc');
				assert.equal(result, Box.Application);
			});

			it('should call onmessage of modules listening for the specific message when called', function() {
				var messageData = {};

				Box.Application.addModule('test', sandbox.stub().returns({
					messages: ['abc'],
					onmessage: sandbox.mock().withArgs('abc', messageData)
				}));
				Box.Application.addModule('test2', sandbox.stub().returns({
					messages: ['abc'],
					onmessage: sandbox.mock().withArgs('abc', messageData)
				}));
				Box.Application.start(testModule);
				Box.Application.start(testModule2);

				Box.Application.broadcast('abc', messageData);
			});

			it('should call corresponding message handler when a message is received', function() {
				var messageData = {};
				Box.Application.addModule('test', sandbox.stub().returns({
					onmessage: {
						'abc': sandbox.mock().withArgs(messageData)
					}
				}));
				Box.Application.start(testModule);

				Box.Application.broadcast('abc', messageData);
			});

			it('should provide the instance of the module or behavior to the message handler when a message is received', function() {
				Box.Application.addModule('test', sandbox.stub().returns({
					onmessage: {
						'abc': function() {
							assert.isTrue(this.onmessage !== undefined);
						}
					}
				}));
				Box.Application.start(testModule);

				Box.Application.broadcast('abc');
			});

			it('should call onmessage of behaviors listening in correct order when defined', function() {
				var messageData = {},
					moduleMessageSpy = sandbox.spy(),
					behaviorMessageSpy = sandbox.spy(),
					behavior2MessageSpy = sandbox.spy();

				Box.Application.addModule('test', sandbox.stub().returns({
					behaviors: ['test-behavior', 'test-behavior2'],
					messages: ['abc'],
					onmessage: moduleMessageSpy
				}));
				Box.Application.addBehavior('test-behavior', sandbox.stub().returns({
					messages: ['abc'],
					onmessage: behaviorMessageSpy
				}));
				Box.Application.addBehavior('test-behavior2', sandbox.stub().returns({
					messages: ['abc'],
					onmessage: behavior2MessageSpy
				}));

				Box.Application.start(testModule);

				Box.Application.broadcast('abc', messageData);

				assert.ok(moduleMessageSpy.calledWith('abc', messageData));
				assert.ok(behaviorMessageSpy.calledWith('abc', messageData));
				assert.ok(behavior2MessageSpy.calledWith('abc', messageData));
				assert.ok(moduleMessageSpy.calledBefore(behaviorMessageSpy), 'module called before first behavior');
				assert.ok(behaviorMessageSpy.calledBefore(behavior2MessageSpy), 'first behavior called before second behavior');
			});


			it('should not call onmessage of a module when the module is stopped and the message is broadcast', function() {
				Box.Application.addModule('test', sandbox.stub().returns({
					messages: ['abc'],
					onmessage: sandbox.mock().never()
				}));
				Box.Application.start(testModule);
				Box.Application.stop(testModule);

				Box.Application.broadcast('abc');
			});

			it('should fire an event when a message is broadcast', function() {

				eventHandlerMock = sandbox.mock().withArgs({
					type: 'message',
					data: {
						message: 'abc',
						messageData: undefined
					}
				});

				Box.Application.on('message', eventHandlerMock);
				Box.Application.broadcast('abc');
			});

			it('should fire an event when a message is broadcast with extra data', function() {

				var extraData = {};
				eventHandlerMock = sandbox.mock().withArgs({
					type: 'message',
					data: {
						message: 'abc',
						messageData: extraData
					}
				});

				Box.Application.on('message', eventHandlerMock);
				Box.Application.broadcast('abc', extraData);
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
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(testModule);

				var config = Box.Application.getModuleConfig(testModule);
				assert.strictEqual(config, null, 'Configuration should be null.');
			});

			it('should return an object when the module has configuration', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(moduleWithConfig);

				var config = Box.Application.getModuleConfig(moduleWithConfig);
				assert.deepEqual(config, { name: 'box' }, 'Configuration key name should be "box".');
			});

			it('should return an object before module initializes when the module has configuration', function() {
				Box.Application.addModule('test', sandbox.stub().returns({}));

				var config = Box.Application.getModuleConfig(moduleWithConfig);
				assert.deepEqual(config, { name: 'box' }, 'Configuration key name should be "box".');
			});

			it('should return config value when name specified', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(moduleWithConfig);

				var config = Box.Application.getModuleConfig(moduleWithConfig, 'name');
				assert.equal(config, 'box', 'Configuration value should be returned');
			});

			it('should return null when config key does not exist', function() {
				Box.Application.addModule('test', sandbox.mock().withArgs(sinon.match.any).returns({}));
				Box.Application.start(moduleWithConfig);

				var config = Box.Application.getModuleConfig(moduleWithConfig, 'abc');
				assert.strictEqual(config, null, 'null should be returned');
			});


		});

		describe('getGlobal()', function() {

			it('should return the window-scope var when it exists', function() {
				window.foo = 'bar';
				assert.strictEqual(Box.Application.getGlobal('foo'), 'bar', 'global var returned');

				// @NOTE(nzakas): IE8 doesn't like delete here
				window.foo = null;
			});

			it('should return the null when global var does not exist', function() {
				assert.strictEqual(Box.Application.getGlobal('nonexistent'), null, 'null returned');
			});

		});


		describe('getGlobalConfig()', function() {

			beforeEach(function() {
				Box.Application.init({
					foo: 'bar'
				});
			});

			it('should return the full config when called without parameters', function() {
				// won't be same object but will have same contents
				assert.deepEqual(Box.Application.getGlobalConfig(), { foo: 'bar' }, 'full config returned');
			});

			it('should return value when it was set during initialization', function() {
				assert.equal(Box.Application.getGlobalConfig('foo'), 'bar', 'config value returned');
			});

			it('should not return value when it was not set during initialization', function() {
				assert.strictEqual(Box.Application.getGlobalConfig('bar'), null, 'missing config value returns null');
			});

		});


		describe('setGlobalConfig()', function() {

			it('should set the globalConfig object', function() {
				Box.Application.setGlobalConfig({
					foo: 'bar'
				});

				assert.equal(Box.Application.getGlobalConfig('foo'), 'bar', 'config value is set');
			});

			it('should return Box.Application when called', function() {
				var result = Box.Application.setGlobalConfig({
					foo: 'bar'
				});
				assert.equal(result, Box.Application);
			});

			it('should throw an error after application initialization', function() {
				Box.Application.init({
					debug: true
				});

				assert.throws(function() {
					Box.Application.setGlobalConfig({
						foo: 'bar'
					});
				});
			});

			it('should have globalConfig overridden by application initialization', function() {
				Box.Application.setGlobalConfig({
					theAnswer: 12
				});

				Box.Application.init({
					theAnswer: 42
				});

				assert.equal(Box.Application.getGlobalConfig('theAnswer'), 42, 'config value is set by init');
			});

		});

		describe('reportError()', function() {

			it('should throw an error when in debug mode', function() {
				Box.Application.init({
					debug: true
				});

				assert.throws(function() {
					Box.Application.reportError(new Error('blah'));
				}, /blah/);

			});

			it('should fire an "error" event when in debug mode', function() {
				Box.Application.init({
					debug: false
				});

				var error = new Error('blah');
				var errorHandlerMock = sandbox.mock().withArgs({
					type: 'error',
					data: {
						exception: error
					}
				});

				Box.Application.on('error', errorHandlerMock);

				Box.Application.reportError(error);

				Box.Application.off('error', errorHandlerMock);

			});

		});

		describe('reportWarning()', function() {

			it('should do a `console.warn` when in debug mode', function() {
				Box.Application.init({
					debug: true
				});

				sandbox.mock(Box.Application).expects('getGlobal').withArgs('console').returns({
					warn: sandbox.mock().withArgs('blah')
				});

				Box.Application.reportWarning('blah');
			});

			it('should fire a "warning" event when not in debug mode', function() {
				Box.Application.init({
					debug: false
				});

				var warningData = {
					foo: 'bar'
				};
				var warningMock = sandbox.mock().withArgs({
					type: 'warning',
					data: warningData
				});

				Box.Application.on('warning', warningMock);

				Box.Application.reportWarning(warningData);

				Box.Application.off('warning', warningMock);
			});

		});

	});

});
