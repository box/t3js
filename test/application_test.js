$(function() {

	module('Box.Application.isStarted', {

		setup: function() {

			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			$('#qunit-fixture').append(this.testModule);

			this.stubProperty(Box, 'Context', function() {
			});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('isStarted returns true when module is started', function() {
		Box.Application.addModule('test', this.stub().returns({}));
		Box.Application.start(this.testModule);

		ok(Box.Application.isStarted(this.testModule), 'Module should be started');
	});

	test('isStarted returns false when module is stopped', function() {
		Box.Application.addModule('test', this.stub().returns({}));
		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);

		ok(!Box.Application.isStarted(this.testModule), 'Module should not be started');
	});

	test('isStarted returns false when module was never started', function() {
		Box.Application.addModule('test', this.stub().returns({}));

		ok(!Box.Application.isStarted(this.testModule), 'Module should not be started');
	});

	module('Box.Application.start', {

		setup: function() {

			Box.Application.init({
				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			this.testModule2 = $('<div class="module" data-module="test" />')[0];
			$('#qunit-fixture').append(this.testModule, this.testModule2);

			this.stubProperty(Box, 'Context', function() {});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('start creates a new module when called with an HTML element with data-module', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.testModule);

		ok(Box.Application.isStarted(this.testModule), 'module started');
	});

	test('start generates different IDs for modules when two modules of the same type are started', function() {
		Box.Application.addModule('test', this.mock().twice().returns({}));
		Box.Application.start(this.testModule);
		Box.Application.start(this.testModule2);

		equal(this.testModule.id, 'mod-test-1', 'First module ID should be set');
		equal(this.testModule2.id, 'mod-test-2', 'Second module ID should be set');
	});

	test('start does not create a new module when "deferred" is present in data-module attribute on element', function() {
		this.testModule.setAttribute('data-module', 'test deferred');
		Box.Application.addModule('test', this.stub().returns({}));
		Box.Application.start(this.testModule);

		ok(!Box.Application.isStarted(this.testModule), 'Module should not be started');
	});

	test('start calls init() on a new module when called with an HTML element with data-module', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({
			init: this.mock()
		}));
		Box.Application.start(this.testModule);
	});

	test('start calls init() on module and behaviors in order they are defined when called', function() {
		var moduleInitSpy = this.spy(),
			behaviorInitSpy = this.spy(),
			behavior2InitSpy = this.spy();

		Box.Application.addModule('test', this.stub().returns({
			behaviors: ['test-behavior', 'test-behavior2'],
			init: moduleInitSpy
		}));
		Box.Application.addBehavior('test-behavior', this.stub().returns({
			init: behaviorInitSpy
		}));
		Box.Application.addBehavior('test-behavior2', this.stub().returns({
			init: behavior2InitSpy
		}));
		Box.Application.start(this.testModule);

		ok(moduleInitSpy.calledBefore(behaviorInitSpy), 'module init called before first behavior init');
		ok(behaviorInitSpy.calledBefore(behavior2InitSpy), 'first behavior init called before second behavior init');
	});

	module('Box.Application.stop', {

		setup: function() {

			Box.Application.init({
				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			$('#qunit-fixture').append(this.testModule);

			this.stubProperty(Box, 'Context', function() {});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('stop stops a module when called with an HTML element with data-module', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);

		ok(!Box.Application.isStarted(this.testModule), 'Module should be stopped');
	});

	test('stop calls destroy() on a module when called with an HTML element with data-module', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({
			destroy: this.mock()
		}));
		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);
	});

	test('stop calls destroy() on module and behaviors in reverse order when called', function() {
		var moduleDestroySpy = this.spy(),
			behaviorDestroySpy = this.spy(),
			behavior2DestroySpy = this.spy();

		Box.Application.addModule('test', this.stub().returns({
			behaviors: ['test-behavior', 'test-behavior2'],
			destroy: moduleDestroySpy
		}));
		Box.Application.addBehavior('test-behavior', this.stub().returns({
			destroy: behaviorDestroySpy
		}));
		Box.Application.addBehavior('test-behavior2', this.stub().returns({
			destroy: behavior2DestroySpy
		}));
		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);

		ok(behavior2DestroySpy.calledBefore(behaviorDestroySpy), 'second behavior destroy called before first behavior destroy');
		ok(behaviorDestroySpy.calledBefore(moduleDestroySpy), 'first behavior destroy called before module destroy');
	});

	module('Box.Application.startAll', {

		setup: function() {

			Box.Application.init({
				
				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			this.testModule2 = $('<div class="module" data-module="test" />')[0];
			this.privilegedModule = $('<div class="module" data-module="privileged" />')[0];
			this.nestedModule = $('<div class="module" data-module="parent"><div class="module" data-module="child"></div></div>')[0];
			$('#qunit-fixture').append(this.testModule, this.testModule2, this.privilegedModule, this.nestedModule);

			this.stubProperty(Box, 'Context', function() {
			});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('startAll starts a child module when called with nested modules', function() {
		Box.Application.addModule('parent', this.mock().never());
		Box.Application.addModule('child', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.startAll(this.nestedModule);

		ok(!Box.Application.isStarted(this.nestedModule), 'Parent module should not be started');
		ok(Box.Application.isStarted(this.nestedModule.children[0]), 'Child module should be started');
	});


	module('Box.Application.stopAll', {

		setup: function() {

			Box.Application.init({

				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			this.testModule2 = $('<div class="module" data-module="test" />')[0];
			this.privilegedModule = $('<div class="module" data-module="privileged" />')[0];
			this.nestedModule = $('<div class="module" data-module="parent"><div class="module" data-module="child"></div></div>')[0];
			$('#qunit-fixture').append(this.testModule, this.testModule2, this.privilegedModule, this.nestedModule);

			this.stubProperty(Box, 'Context', function() {
			});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('stopAll stops nested module', function() {
		Box.Application.addModule('child', this.stub().returns({}));

		Box.Application.startAll(this.nestedModule);
		Box.Application.stopAll(this.nestedModule);

		ok(!Box.Application.isStarted(this.nestedModule.children[0]), 'child module stopped');
	});

	module('Event Handling', {

		setup: function() {

			Box.Application.init({
				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target" data-type="target"></span></div>')[0];
			this.testModule2 = $('<div class="module" data-module="test" />')[0];
			this.privilegedModule = $('<div class="module" data-module="privileged" />')[0];
			this.nestedModule = $('<div class="module" data-module="parent"><div class="module" data-module="child"></div></div>')[0];
			$('#qunit-fixture').append(this.testModule, this.testModule2, this.privilegedModule, this.nestedModule);

			this.stubProperty(Box, 'Context', function() {});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('onclick should be called when a click occurs inside of a started module', function() {
		Box.Application.addModule('test', this.stub().returns({
			onclick: this.mock()
		}));

		Box.Application.addService('dom', this.stub().returns({
			getNearestTypeElement: function() {
			},
			getData: function() {
			}
		}));

		Box.Application.start(this.testModule);

		$('#module-target').trigger({
			type: 'click',
			button: 1
		});
	});

	test('onclick should be called on behaviors in correct order when defined', function() {
		var moduleClickSpy = this.spy(),
			behaviorClickSpy = this.spy();
			behavior2ClickSpy = this.spy();

		Box.Application.addModule('test', this.stub().returns({
			behaviors: ['test-behavior', 'test-behavior2'],
			onclick: moduleClickSpy
		}));

		Box.Application.addBehavior('test-behavior', this.stub().returns({
			onclick: behaviorClickSpy
		}));
		Box.Application.addBehavior('test-behavior2', this.stub().returns({
			onclick: behavior2ClickSpy
		}));

		Box.Application.addService('dom', this.stub().returns({
			getNearestTypeElement: function() {
			},
			getData: function() {
			}
		}));

		Box.Application.start(this.testModule);

		$('#module-target').trigger({
			type: 'click',
			button: 1
		});

		ok(moduleClickSpy.calledBefore(behaviorClickSpy), 'module called before first behavior');
		ok(behaviorClickSpy.calledBefore(behavior2ClickSpy), 'first behavior called before second behavior');
	});

	test('onclick should not be called when a right click occurs inside of a started module', function() {
		Box.Application.addModule('test', this.stub().returns({
			onclick: this.mock().never()
		}));

		Box.Application.addService('dom', this.stub().returns({
			getNearestTypeElement: function() {
			},
			getData: function() {
			}
		}));

		Box.Application.start(this.testModule);

		$('#module-target').trigger({
			type: 'click',
			button: 2
		});
	});

	test('onclick should be called with the nearest type element and type when a click occurs inside of a started module', function() {
		Box.Application.addModule('test', this.stub().returns({
			onclick: this.mock().withArgs(sinon.match.any, $('#module-target')[0], $('#module-target').data('type'))
		}));

		Box.Application.addService('dom', this.stub().returns({
			getNearestTypeElement: function() {
				return $('#module-target')[0];
			},
			getData: function() {
				return $('#module-target').data('type');
			}
		}));

		Box.Application.start(this.testModule);

		$('#module-target').trigger({
			type: 'click',
			button: 1
		});
	});

	test('onclick should not be called when a click occurs inside of a stopped module', function() {
		Box.Application.addModule('test', this.stub().returns({
			onclick: this.mock().never()
		}));

		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);

		$('#module-target').trigger({
			type: 'click',
			button: 1
		});
	});

	module('Box.Application.broadcast', {

		setup: function() {

			Box.Application.init({

				privilegedModules: ['privileged']
			});

			// add after init() to ensure we won't have errors due to missing
			// module definitions
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			this.testModule2 = $('<div class="module" data-module="test" />')[0];
			this.privilegedModule = $('<div class="module" data-module="privileged" />')[0];
			this.nestedModule = $('<div class="module" data-module="parent"><div class="module" data-module="child"></div></div>')[0];
			$('#qunit-fixture').append(this.testModule, this.testModule2, this.privilegedModule, this.nestedModule);

			this.stubProperty(Box, 'Context', function() {});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('onmessage should be called on all modules listening for it when the message is broadcast', function() {
		var messageData = {};

		Box.Application.addModule('test', this.stub().returns({
			messages: ['abc'],
			onmessage: this.mock().withArgs('abc', messageData)
		}));
		Box.Application.addModule('privileged', this.stub().returns({
			messages: ['abc'],
			onmessage: this.mock().withArgs('abc', messageData)
		}));
		Box.Application.start(this.testModule);
		Box.Application.start(this.privilegedModule);

		Box.Application.broadcast('abc', messageData);
	});

	test('onmessage should be called on behaviors in correct order when defined', function() {
		var messageData = {},
			moduleMessageSpy = this.spy(),
			behaviorMessageSpy = this.spy(),
			behavior2MessageSpy = this.spy();

		Box.Application.addModule('test', this.stub().returns({
			behaviors: ['test-behavior', 'test-behavior2'],
			messages: ['abc'],
			onmessage: moduleMessageSpy
		}));
		Box.Application.addBehavior('test-behavior', this.stub().returns({
			messages: ['abc'],
			onmessage: behaviorMessageSpy
		}));
		Box.Application.addBehavior('test-behavior2', this.stub().returns({
			messages: ['abc'],
			onmessage: behavior2MessageSpy
		}));

		Box.Application.start(this.testModule);

		Box.Application.broadcast('abc', messageData);

		ok(moduleMessageSpy.calledWith('abc', messageData));
		ok(behaviorMessageSpy.calledWith('abc', messageData));
		ok(behavior2MessageSpy.calledWith('abc', messageData));
		ok(moduleMessageSpy.calledBefore(behaviorMessageSpy), 'module called before first behavior');
		ok(behaviorMessageSpy.calledBefore(behavior2MessageSpy), 'first behavior called before second behavior');
	});

	test('onmessage should not be called when the module is stopped and the message is broadcast', function() {
		Box.Application.addModule('test', this.stub().returns({
			messages: ['abc'],
			onmessage: this.mock().never()
		}));
		Box.Application.start(this.testModule);
		Box.Application.stop(this.testModule);

		Box.Application.broadcast('abc');
	});

	module('Services', {
		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('getService should call the creator function with application as an argument when called for an existing service', function() {
		Box.Application.addService('test', this.mock().withExactArgs(Box.Application));
		Box.Application.getService('test');
	});

	test('getService should return the object that is returned from the creator function when called for an existing service', function() {
		var testService = {};

		Box.Application.addService('test', this.stub().returns(testService));

		equal(Box.Application.getService('test'), testService, 'constructed service returned');
	});

	test('getService should return the same object for each call when called for the same service multiple times', function() {
		Box.Application.addService('test', this.mock().once().returns({}));

		var first = Box.Application.getService('test');
		var second = Box.Application.getService('test');
		equal(first, second, 'same service returned');
	});

	test('getService should return null when called for a non-existing service', function() {
		var service = Box.Application.getService('test');
		equal(service, null, 'null returned');
	});

	module('Passthrough Methods', {
		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('Calling navigate() should pass through to navigation service when called', function() {
		var url = 'http://example.com',
			state = {},
			params = {};

		Box.Application.addService('navigation', this.stub().returns({
			navigate: this.mock().withArgs(url, state, params)
		}));

		Box.Application.navigate(url, state, params);

	});

	module('Box.Application.getModuleConfig', {
		setup: function() {
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			this.moduleWithConfig = $('<div class="module" data-module="test"><script type="text/x-config">{"name":"box"}</script></div>')[0];

			$('#qunit-fixture').append(this.testModule, this.moduleWithConfig);

			this.stubProperty(Box, 'Context', function() {
			});

		},
		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('getModuleConfig should return null when the module has no configuration', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.testModule);

		var config = Box.Application.getModuleConfig(this.testModule);
		strictEqual(config,  null, 'Configuration should be null.');
	});

	test('getModuleConfig should return an object when the module has configuration', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.moduleWithConfig);

		var config = Box.Application.getModuleConfig(this.moduleWithConfig);
		deepEqual(config, {name:'box'}, 'Configuration key name should be "box".');
	});

	test('getModuleConfig should return config value when name specified', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.moduleWithConfig);

		var config = Box.Application.getModuleConfig(this.moduleWithConfig, 'name');
		equal(config, 'box', 'Configuration value should be returned');
	});

	test('getModuleConfig should return null when config key does not exist', function() {
		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({}));
		Box.Application.start(this.moduleWithConfig);

		var config = Box.Application.getModuleConfig(this.moduleWithConfig, 'abc');
		strictEqual(config, null, 'null should be returned');
	});


	module('Module Error Handling', {

		setup: function() {

			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];

			$('#qunit-fixture').append(this.testModule);

			this.stubProperty(Box, 'Context', function() {});
		},

		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('An error in a module\'s init() should be re-thrown with a fixed error message when in debug mode', function() {

		Box.Application.addModule('test', this.mock().withArgs(sinon.match.any).returns({
			init: this.stub().throws('Something bad happened.')
		}));

		raises(function() {
			Box.Application.init({ debug: true });
		}, 'test.init() - Something bad happened.');

	});


	test('An error in a module\'s init() should fire an event when not in debug mode', function() {

		Box.Application.addModule('test', this.stub().returns({
			init: this.stub().throws('Something bad happened.')
		}));

		var mock = this.mock().withArgs(sinon.match({
			type: 'error',
			data: sinon.match({
				message: 'test.init()',
				exception: sinon.match({
					name: 'test.init() - Something bad happened.'
				})
			})
		}));

		Box.Application.on('error', mock);
		Box.Application.init();
		Box.Application.off('error', mock);

	});


	module('Behaviors', {

		setup: function() {
			this.testModule = $('<div class="module" data-module="test"><span id="module-target"></span></div>')[0];
			$('#qunit-fixture').append(this.testModule);

			this.stubProperty(Box, 'Context', function() {});
		},
		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('Error should be fired when a module specifies a behavior that does not exist', function() {
		Box.Application.addModule('test', this.stub().returns({
			behaviors: ['test-behavior']
		}));

		// Using atLeast(1) since both bindEventListeners and the init loop call getBehaviors twice
		var mock = this.mock().atLeast(1).withArgs(sinon.match({
			type: 'error',
			data: sinon.match({
				message: 'Behavior "test-behavior" not found'
			})
		}));

		Box.Application.on('error', mock);

		Box.Application.start(this.testModule);

		Box.Application.off('error', mock);
	});


	module('Global config', {
		setup: function() {
			Box.Application.init({
				foo: 'bar'
			});
		},
		teardown: function() {
			Box.Application.destroy();
		}
	});

	test('getGlobalConfig() should return the full config when called without parameters', function() {
		// won't be same object but will have same contents
		deepEqual(Box.Application.getGlobalConfig(), { foo: 'bar' }, 'full config returned');
	});

	test('getGlobalConfig() should return value when it was set during initialization', function() {
		equal(Box.Application.getGlobalConfig('foo'), 'bar', 'config value returned');
	});

	test('getGlobalConfig() should not return value when it was not set during initialization', function() {
		strictEqual(Box.Application.getGlobalConfig('bar'), null, 'missing config value returns null');
	});
});

