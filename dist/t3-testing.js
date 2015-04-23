/*! t3 v 1.2.0*/
/*!
Copyright 2015 Box, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// Start wrapper
// We use this to make sure we don't assign globals unless we actually want to
(function(window) {

/**
 * @fileoverview Base namespaces for Box JavaScript.
 * @author Box
 */

/* eslint-disable no-unused-vars */

/**
 * The one global object for Box JavaScript.
 * @namespace
 */
var Box = {};
/* eslint-enable no-unused-vars */

/**
 * @fileoverview Definition of a custom event type. This is used as a utility
 * throughout the framework whenever custom events are used. It is intended to
 * be inherited from, either through the prototype or via mixin.
 * @author Box
 */

Box.EventTarget = (function() {

	'use strict';

	/**
	 * An object that is capable of generating custom events and also
	 * executing handlers for events when they occur.
	 * @constructor
	 */
	function EventTarget() {

		/**
		 * Map of events to handlers. The keys in the object are the event names.
		 * The values in the object are arrays of event handler functions.
		 * @type {Object}
		 * @private
		 */
		this._handlers = {};
	}

	EventTarget.prototype = {

		// restore constructor
		constructor: EventTarget,

		/**
		 * Adds a new event handler for a particular type of event.
		 * @param {string} type The name of the event to listen for.
		 * @param {Function} handler The function to call when the event occurs.
		 * @returns {void}
		 */
		on: function(type, handler) {

			var handlers = this._handlers[type],
				i,
				len;

			if (typeof handlers === 'undefined') {
				handlers = this._handlers[type] = [];
			}

			for (i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] === handler) {
					// prevent duplicate handlers
					return;
				}
			}

			handlers.push(handler);
		},

		/**
		 * Fires an event with the given name and data.
		 * @param {string} type The type of event to fire.
		 * @param {Object} [data] An object with properties that should end up on
		 *                        the event object for the given event.
		 * @returns {void}
		 */
		fire: function(type, data) {

			var handlers,
				i,
				len,
				event = {
					type: type,
					data: data
				};

			// if there are handlers for the event, call them in order
			handlers = this._handlers[event.type];
			if (handlers instanceof Array) {
				// @NOTE: do a concat() here to create a copy of the handlers array,
				// so that if another handler is removed of the same type, it doesn't
				// interfere with the handlers array during this loop
				handlers = handlers.concat();
				for (i = 0, len = handlers.length; i < len; i++) {
					handlers[i].call(this, event);
				}
			}
		},

		/**
		 * Removes an event handler from a given event.
		 * @param {string} type The name of the event to remove from.
		 * @param {Function} handler The function to remove as a handler.
		 * @returns {void}
		 */
		off: function(type, handler) {

			var handlers = this._handlers[type],
				i,
				len;

			if (handlers instanceof Array) {
				for (i = 0, len = handlers.length; i < len; i++) {
					if (handlers[i] === handler) {
						handlers.splice(i, 1);
						break;
					}
				}
			}
		}
	};

	return EventTarget;

}());

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

/**
 * @fileoverview A service provider that also contains a few pre-stubbed functions
 * @author Box
 */

(function() {

	'use strict';

	// We should use a reference directly the original application-stub object in case Box.Application gets stubbed out
	var application = Box.Application;

	// function stubs that are automatically included on a TestServiceProvider
	var APPLICATION_CONTEXT_STUBS = [
		// Shared between Application and Context
		'broadcast', 'getGlobalConfig', 'reportError',

		// Application (only ones that should be called from a service)
		'start', 'stop', 'startAll', 'stopAll', 'isStarted',

		// Context (module/behavior only) - getElement done separately
		'getConfig'
	];

	/**
	 * Return a function stub that will throw an error if the test code does not properly mock out dependencies.
	 * @param {string} method The name of the method being invoked
	 * @returns {Function} A function stub
	 */
	function functionStub(method) {
		return (function(methodKey) {
			return function() {
				throw new Error('Unexpected call to method "' + methodKey + '". You must stub this method out.');
			};
		}(method));
	}

	/**
	 * This object is used as a stub for application/context that is normally passed into services/modules/behaviors at create time.
	 * It exposes the stubbed services passed in through the getService() method and can also return real services if necessary.
	 * @param {Object} serviceStubs A map of service stubs
	 * @constructor
	 */
	Box.TestServiceProvider = function(serviceStubs) {
		this.stubs = serviceStubs || {};
	};

	Box.TestServiceProvider.prototype = {

		/**
		 * Will retrieve either a service stub (prioritized) or the real service. Returns null if neither exists.
		 * @param {string} serviceName The name of the service being retrieved
		 * @returns {?Object} A service object or null if none exists
		 */
		getService: function(serviceName) {
			var service = this.stubs[serviceName],
				preRegisteredService;

			// Return a service stub if found
			if (service) {
				return service;
			}

			// Return a real registered service, if it exists (sometimes you want the real deal, i.e. utils)
			preRegisteredService = application.getServiceForTest(serviceName, this);
			if (preRegisteredService) {
				return preRegisteredService;
			}

			return null;
		},

		/**
		 * Retrieves a global var (this is the actual implementation for convenience in testing)
		 * @param {string} name The name of the global
		 * @returns {?*} The global object referenced or null if it does not exist
		 */
		getGlobal: function(name) {
			if (name in window) {
				return window[name];
			} else {
				return null;
			}
		}
	};

	// Add stubbed functions onto prototype for testing convenience
	var stubName;
	for (var i = 0, len = APPLICATION_CONTEXT_STUBS.length; i < len; i++) {
		stubName = APPLICATION_CONTEXT_STUBS[i];
		Box.TestServiceProvider.prototype[stubName] = functionStub(stubName);
	}

}());

	// CommonJS/npm, we want to export Box instead of assigning to global Window
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = Box;
	} else {
		// Make sure not to override Box namespace
		window.Box = window.Box || {};

		// Copy all properties onto namespace (ES3 safe for loop)
		for (var key in Box) {
			if (Box.hasOwnProperty(key)) {
				window.Box[key] = Box[key];
			}
		}
	}

// Potentially window is not defined yet, so bind to 'this' instead
}(typeof window !== 'undefined' ? window : this));
// End Wrapper

