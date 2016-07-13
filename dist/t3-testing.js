/*! t3-testing v2.6.0 */
/*!
Copyright 2016 Box, Inc. All rights reserved.

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
 * @fileoverview DOM abstraction to use native browser functionality to add and remove event listeners
 * in T3
 * @author jdivock
 */


Box.NativeDOM = (function(){
	'use strict';

	return {

		type: 'native',

		/**
		 * Returns the first element that is a descendant of the element
		 * on which it is invoked that matches the specified group of selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {HTMLElement} first element found matching query
		 */
		query: function(root, selector){
			return root.querySelector(selector);
		},

		/**
		 * Returns a non-live NodeList of all elements descended from the
		 * element on which it is invoked that match the specified group of CSS selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {Array} elements found matching query
		 */
		queryAll: function(root, selector){
			return root.querySelectorAll(selector);
		},

		/**
		 * Adds event listener to element using native event listener
		 * @param {HTMLElement} element Target to attach listener to
		 * @param {string} type Name of the action to listen for
		 * @param {function} listener Function to be executed on action
		 *
		 * @returns {void}
		 */
		on: function(element, type, listener) {
			element.addEventListener(type, listener, false);
		},

		/**
		 * Removes event listener to element using native event listener functions
		 * @param {HTMLElement} element Target to remove listener from
		 * @param {string} type Name of the action remove listener from
		 * @param {function} listener Function to be removed from action
		 *
		 * @returns {void}
		 */
		off: function(element, type, listener) {
			element.removeEventListener(type, listener, false);
		}
	};
}());

Box.DOM = Box.NativeDOM;

/**
 * @fileoverview An object that encapsulates event delegation wireup for a
 * DOM element.
 * @author Box
 */

Box.DOMEventDelegate = (function() {

	'use strict';

	// Supported events for modules. Only events that bubble properly can be used in T3.
	var DEFAULT_EVENT_TYPES = ['click', 'mouseover', 'mouseout', 'mousedown', 'mouseup',
			'mouseenter', 'mouseleave', 'mousemove', 'keydown', 'keyup', 'submit', 'change',
			'contextmenu', 'dblclick', 'input', 'focusin', 'focusout'];


	/**
	 * Determines if a given element represents a module.
	 * @param {HTMLElement} element The element to check.
	 * @returns {boolean} True if the element represents a module, false if not.
	 * @private
	 */
	function isModuleElement(element) {
		return element && element.hasAttribute('data-module');
	}

	/**
	 * Determines if a given element represents a T3 type.
	 * @param {HTMLElement} element The element to check.
	 * @returns {boolean} True if the element represents a T3 type, false if not.
	 * @private
	 */
	function isTypeElement(element) {
		return element && element.hasAttribute('data-type');
	}

	/**
	 * Finds the closest ancestor that of an element that has a data-type
	 * attribute.
	 * @param {HTMLElement} element The element to start searching from.
	 * @returns {HTMLElement} The matching element or null if not found.
	 */
	function getNearestTypeElement(element) {
		var found = false;
		var moduleBoundaryReached = false;

		// We need to check for the existence of 'element' since occasionally we call this on a detached element node.
		// For example:
		//  1. event handlers like mouseout may sometimes detach nodes from the DOM
		//  2. event handlers like mouseleave will still fire on the detached node
		// Checking existence of element.parentNode ensures the element is a valid HTML Element
		while (!found && element && element.parentNode && !moduleBoundaryReached) {
			found = isTypeElement(element);
			moduleBoundaryReached = isModuleElement(element);

			if (!found) {
				element = element.parentNode;
			}

		}

		return found ? element : null;
	}

	/**
	 * Iterates over each supported event type that is also in the handler, applying
	 * a callback function. This is used to more easily attach/detach all events.
	 * @param {string[]} eventTypes A list of event types to iterate over
	 * @param {Object} handler An object with onclick, onmouseover, etc. methods.
	 * @param {Function} callback The function to call on each event type.
	 * @param {Object} [thisValue] The value of "this" inside the callback.
	 * @returns {void}
	 * @private
	 */
	function forEachEventType(eventTypes, handler, callback, thisValue) {

		var i,
			type;

		for (i = 0; i < eventTypes.length; i++) {
			type = eventTypes[i];

			// only call the callback if the event is on the handler
			if (handler['on' + type]) {
				callback.call(thisValue, type);
			}
		}
	}

	/**
	 * An object that manages events within a single DOM element.
	 * @param {HTMLElement} element The DOM element to handle events for.
	 * @param {Object} handler An object containing event handlers such as "onclick".
	 * @param {string[]} [eventTypes] A list of event types to handle (events must bubble). Defaults to a common set of events.
	 * @constructor
	 */
	function DOMEventDelegate(element, handler, eventTypes) {

		/**
		 * The DOM element that this object is handling events for.
		 * @type {HTMLElement}
		 */
		this.element = element;

		/**
		 * Object on which event handlers are available.
		 * @type {Object}
		 * @private
		 */
		this._handler = handler;

		/**
		 * List of event types to handle (make sure these events bubble!)
		 * @type {string[]}
		 * @private
		 */
		this._eventTypes = eventTypes || DEFAULT_EVENT_TYPES;

		/**
		 * Tracks event handlers whose this-value is bound to the correct
		 * object.
		 * @type {Object}
		 * @private
		 */
		this._boundHandler = {};

		/**
		 * Indicates if events have been attached.
		 * @type {boolean}
		 * @private
		 */
		this._attached = false;
	}


	DOMEventDelegate.prototype = {

		// restore constructor
		constructor: DOMEventDelegate,

		_handleEvent: function(event) {
			var targetElement = getNearestTypeElement(event.target),
				elementType = targetElement ? targetElement.getAttribute('data-type') : '';

			this._handler['on' + event.type](event, targetElement, elementType);
		},

		/**
		 * Attaches all event handlers for the DOM element.
		 * @returns {void}
		 */
		attachEvents: function() {
			if (!this._attached) {

				forEachEventType(this._eventTypes, this._handler, function(eventType) {
					var that = this;

					function handleEvent() {
						that._handleEvent.apply(that, arguments);
					}

					Box.DOM.on(this.element, eventType, handleEvent);

					this._boundHandler[eventType] = handleEvent;
				}, this);

				this._attached = true;
			}
		},

		/**
		 * Detaches all event handlers for the DOM element.
		 * @returns {void}
		 */
		detachEvents: function() {
			forEachEventType(this._eventTypes, this._handler, function(eventType) {
				Box.DOM.off(this.element, eventType, this._boundHandler[eventType]);
			}, this);
		}
	};

	return DOMEventDelegate;
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
			 * @returns {Box.Application} The application object.
			 */
			reset: function() {
				services = {};
				modules = {};
				behaviors = {};
				return this;
			},

			/**
			 * Registers a service to the application stub
			 * @param {string} serviceName The name of the service
			 * @param {Function} creator The service creator function
			 * @returns {Box.Application} The application object.
			 */
			addService: function(serviceName, creator) {
				services[serviceName] = {
					creator: creator
				};
				return this;
			},

			/**
			 * Registers a module to the application stub
			 * @param {string} moduleName The name of the module
			 * @param {Function} creator The behavior creator function
			 * @returns {Box.Application} The application object.
			 */
			addModule: function(moduleName, creator) {
				modules[moduleName] = {
					creator: creator
				};
				return this;
			},

			/**
			 * Registers a behavior to the application stub
			 * @param {string} behaviorName The name of the behavior
			 * @param {Function} creator The behavior creator function
			 * @returns {Box.Application} The application object.
			 */
			addBehavior: function(behaviorName, creator) {
				behaviors[behaviorName] = {
					creator: creator
				};
				return this;
			},

			/**
			 * Checks if a service exists
			 * @param {string} serviceName The name of the service to check.
			 * @returns {boolean} True, if service exist. False, otherwise.
			 */
			hasService: function(serviceName) {
				return services.hasOwnProperty(serviceName);
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
		'broadcast', 'getGlobalConfig', 'reportError', 'reportWarning', 'reportInfo',

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
		/* eslint-disable no-extra-parens */
		return (function(methodKey) {
			return function() {
				throw new Error('Unexpected call to method "' + methodKey + '". You must stub this method out.');
			};
		}(method));
		/* eslint-enable no-extra-parens */
	}

	/**
	 * Check if service is allowed. This should be replaced by Array.prototype.indexOf when we drop IE 8 support
	 * @param {string} serviceName The name of the service being checked
	 * @param {string[]} allowedServicesList The list of services allowed by the user
	 * @returns {boolean} Returns true if service is in the allowed list
	 * @private
	 */
	function isServiceAllowed(serviceName, allowedServicesList) {
		for (var i = 0, len = allowedServicesList.length; i < len; i++) {
			if (allowedServicesList[i] === serviceName) {
				return true;
			}
		}
		return false;
	}

	/**
	 * This object is used as a stub for application/context that is normally passed into services/modules/behaviors at create time.
	 * It exposes the stubbed services passed in through the getService() method. Also allows the use of pre-registered services.
	 * @param {Object} serviceStubs A map of service stubs
	 * @param {string[]} [allowedServicesList] List of real services to allow access to
	 * @constructor
	 */
	Box.TestServiceProvider = function(serviceStubs, allowedServicesList) {
		this.stubs = serviceStubs || {};
		this.allowedServicesList = allowedServicesList || [];
		this.serviceInstances = {}; // Stores the instances of pre-registered services
	};

	Box.TestServiceProvider.prototype = {
		constructor: Box.TestServiceProvider,

		/**
		 * Will retrieve either a service stub (prioritized) or the real service. Returns null if neither exists.
		 * @param {string} serviceName The name of the service being retrieved
		 * @returns {?Object} A service object or null if none exists
		 * @throws {Error} Will throw an error if service does not exist
		 */
		getService: function(serviceName) {
			var service = this.stubs[serviceName];

			// Return a service stub if found
			if (service) {
				return service;
			}

			// Check if this service is allowed to be pre-registered
			if (isServiceAllowed(serviceName, this.allowedServicesList)) {
				// Now check if we've already created the service instance
				if (this.serviceInstances.hasOwnProperty(serviceName)) {
					return this.serviceInstances[serviceName];
				} else {
					var preRegisteredService = application.getServiceForTest(serviceName, this);
					if (preRegisteredService) {
						// Save the instance for the next call to getService()
						this.serviceInstances[serviceName] = preRegisteredService;
						return preRegisteredService;
					} else {
						throw new Error('Service "' + serviceName + '" does not exist.');
					}
				}

			} else {
				throw new Error('Service "' + serviceName + '" is not on the `allowedServiceList`. Use "new Box.TestServiceProvider({ ...stubs... }, [\'' + serviceName + '\']);" or stub the service out.');
			}
		},

		/**
		 * Checks if a service exists
		 * @param {string} serviceName The name of the service to check.
		 * @returns {boolean} True, if service exist. False, otherwise.
		 */
		hasService: function(serviceName) {
			return this.stubs.hasOwnProperty(serviceName) || isServiceAllowed(serviceName, this.allowedServicesList) && application.hasService(serviceName);
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
	(function() {
		var stubName;
		for (var i = 0, len = APPLICATION_CONTEXT_STUBS.length; i < len; i++) {
			stubName = APPLICATION_CONTEXT_STUBS[i];
			Box.TestServiceProvider.prototype[stubName] = functionStub(stubName);
		}
	}());

}());

	if (typeof define === 'function' && define.amd) {
		// AMD
		define('t3', [], function() {
			return Box;
		});
	} else if (typeof module === 'object' && typeof module.exports === 'object') {
		// CommonJS/npm, we want to export Box instead of assigning to global Window
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
