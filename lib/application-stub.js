/**
 * @fileoverview Fake application to use during testing
 * @author Box
 */

(function() {

	'use strict';

	/*
	 * When testing actual Application, it should be included after to overwrite this stub.
	 */
	Box.Application = (function() {

		var services = {},
			modules = {},
			behaviors = {};

		return {

			/**
			 * Resets the application stub back to a clean state. Will also remove pre-registered components.
			 * @returns {void}
			 */
			reset: function() {
				services = {};
				modules = {};
				behaviors = {};
			},

			/**
			 * Registers a service to the application stub
			 * @param {string} serviceName The name of the service
			 * @param {Function} creator The service creator function
			 * @returns {void}
			 */
			addService: function(serviceName, creator) {
				services[serviceName] = {
					creator: creator
				};
			},

			/**
			 * Registers a module to the application stub
			 * @param {string} moduleName The name of the module
			 * @param {Function} creator The behavior creator function
			 * @returns {void}
			 */
			addModule: function(moduleName, creator) {
				modules[moduleName] = {
					creator: creator
				};
			},

			/**
			 * Registers a behavior to the application stub
			 * @param {string} behaviorName The name of the behavior
			 * @param {Function} creator The behavior creator function
			 * @returns {void}
			 */
			addBehavior: function(behaviorName, creator) {
				behaviors[behaviorName] = {
					creator: creator
				};
			},

			/**
			 * Will create a new instance of a service with the given application context
			 * @param {string} serviceName The name of the service being created
			 * @param {Object} application The application context object (usually a TestServiceProvider)
			 * @returns {?Object} The service object
			 */
			getServiceForTest: function(serviceName, application) {
				var serviceData = services[serviceName];
				if (serviceData) {
					return services[serviceName].creator(application);
				}
				return null;
			},

			/**
			 * Will create a new instance of a module with a given context
			 * @param {string} moduleName The name of the module being created
			 * @param {Object} context The context object (usually a TestServiceProvider)
			 * @returns {?Object} The module object
			 */
			getModuleForTest: function(moduleName, context) {
				var module = modules[moduleName].creator(context);

				if (!context.getElement) {
					// Add in a default getElement function that matches the first module element
					// Developer should stub this out if there are more than one instance of this module
					context.getElement = function() {
						return document.querySelector('[data-module="' + moduleName + '"]');
					};
				}
				return module;
			},

			/**
			 * Will create a new instance of a behavior with a given context
			 * @param {string} behaviorName The name of the behavior being created
			 * @param {Object} context The context object (usually a TestServiceProvider)
			 * @returns {?Object} The behavior object
			 */
			getBehaviorForTest: function(behaviorName, context) {
				var behaviorData = behaviors[behaviorName];
				if (behaviorData) {
					// getElement on behaviors must be stubbed
					if (!context.getElement) {
						context.getElement = function() {
							throw new Error('You must stub `getElement` for behaviors.');
						};
					}
					return behaviors[behaviorName].creator(context);
				}
				return null;
			}

		};

	}());

}());
