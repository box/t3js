/**
 * @fileoverview Fake application to use during testing
 * @author Box
 */

if (!window.Box) {
	window.Box = {};
}

(function() {

	/**
	 * When testing actual Application, it should be included after to overwrite this stub.
	 */
	Box.Application = (function() {

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

			on: function() {
			}

		};

	}());


	Box.TestServiceProvider = function(config) {
		this.stubs = config || {};
	};


	Box.TestServiceProvider.prototype = {
		getService: function(serviceName) {
			var service = this.stubs[serviceName];

			if (service) {
				return service;
			}

			return null;
		},
		getConfig: function() {
			return null;
		},
		broadcast: function() {}
	};
}());
