if (!window.Box) {
	Box = {};
}

(function() {
	/**
	 * When testing actual Application, it should be included after to overwrite this stub.
	 * Also saved to a local 'application' variable for tests that overwrite the Box.Application global
	 */
	var application = Box.Application = (function() {

		var modules = {},
			services = {},
			behaviors = {};

		return {

			reset: function() {
				modules = {};
				services = {};
				behaviors = {};
			},

			addModule: function(moduleName, creator) {
				modules[moduleName] = {
					creator: creator
				};
			},

			addService: function(serviceName, creator) {
				services[serviceName] = {
					creator: creator
				};
			},

			addBehavior: function(behaviorName, creator) {
				behaviors[behaviorName] = {
					creator: creator
				};
			},

			// Automatically adds a getElement function to the context object
			// that will return the corresponding module on the page
			getModuleForTest: function(moduleName, context) {
				var module = modules[moduleName].creator(context);

				if (!context.getElement) {
					context.getElement = function() {
						return $('#mod-' + moduleName)[0];
					};
				}
				return module;
			},

			getBehaviorForTest: function(behaviorName, application) {
				var behaviorData = behaviors[behaviorName];
				if (behaviorData) {
					return behaviors[behaviorName].creator(application);
				}
				return null;
			},

			getServiceForTest: function(serviceName, application) {
				var serviceData = services[serviceName];
				if (serviceData) {
					return services[serviceName].creator(application);
				}
				return null;
			},

			// For code that uses services during initializing
			getService: function(serviceName) {
				return null;
			},

			on: function() {
			}

		};

	}());


	Box.TestV5 = function(globals) {
		this.globals = globals || {};
	};

	Box.TestV5.prototype = {
		get: function(name) {
			var object = this.globals[name];

			if (object && typeof object.get === 'function') {
				object = object.get();
			}

			return object;
		}
	};

	// Create a default, empty v5
	Box.Application.addService('v5', function() {
		return new Box.TestV5();
	});


	Box.TestServiceProvider = function(config) {
		this.stubs = config || {};
	};

	Box.TestServiceProvider.prototype = {
		getService: function(serviceName) {
			var service,
				preRegisteredService;

			service = this.stubs[serviceName];
			if (service) {
				return service;
			}

			// Return services available by default in tests (eg. dummy v5, dom)
			preRegisteredService = application.getServiceForTest(serviceName, this);
			if (preRegisteredService) {
				return preRegisteredService;
			}

			return null;
		},
		getConfig: function() {
			return null;
		},
		broadcast: function() {}
	};
}());
