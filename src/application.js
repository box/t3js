/**
 * @fileoverview Contains the main application object that is the heart of the
 *               JavaScript architecture.
 * @author Box
 */

/**
 * The core application object where components are registered and managed
 * @mixes Box.EventTarget
 * @namespace
 */
Box.Application = (function() {

	'use strict';

	//--------------------------------------------------------------------------
	// Virtual Types
	//--------------------------------------------------------------------------

	/**
	 * An object representing information about a module.
	 * @typedef {Object} Box.Application~ModuleData
	 * @property {Function} creator The function that creates an instance of this module.
	 * @property {int} counter The number of module instances.
	 */

	/**
	 * An object representing information about a module instance.
	 * @typedef {Object} Box.Application~ModuleInstanceData
	 * @property {string} moduleName The name of the module.
	 * @property {Box.Application~ModuleInstance} instance The module instance.
	 * @property {Box.Context} context The context object for the module.
	 * @property {HTMLElement} element The DOM element associated with the module.
	 * @property {Object} eventHandlers Handler callback functions by event type.
	 */

	/**
	 * A module object.
	 * @typedef {Object} Box.Application~Module
	 */

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

	var MODULE_CLASS_SELECTOR = '.module';

	var globalConfig = {},   // Global configuration
		modules = {},        // Information about each registered module by moduleName
		services = {},       // Information about each registered service by serviceName
		behaviors = {},      // Information about each registered behavior by behaviorName
		instances = {},      // Module instances keyed by DOM element id
		exports = [],        // Method names that were added to application/context by services
		initialized = false, // Flag whether the application has been initialized

		application = new Box.EventTarget();	// base object for application

	// Supported events for modules
	var eventTypes = ['click', 'mouseover', 'mouseout', 'mousedown', 'mouseup',
			'mouseenter', 'mouseleave', 'keydown', 'keyup', 'submit', 'change',
			'contextmenu', 'dblclick'];

	/**
	 * Reset all state to its default values
	 * @returns {void}
	 * @private
	 */
	function reset() {
		globalConfig = {};
		modules = {};
		services = {};
		behaviors = {};
		instances = {};
		initialized = false;

		for (var i = 0; i < exports.length; i++) {
			delete application[exports[i]];
			delete Box.Context.prototype[exports[i]];
		}
		exports = [];
	}

	/**
	 * Signals that an error has occurred. If in development mode, an error
	 * is thrown. If in production mode, an event is fired.
	 * @param {Error} [exception] The exception object to use.
	 * @returns {void}
	 * @private
	 */
	function error(exception) {

		if (globalConfig.debug) {
			throw exception;
		} else {
			application.fire('error', {
				exception: exception
			});
		}
	}

	/**
	 * Wraps all methods on an object with try-catch so that objects don't need
	 * to worry about trapping their own errors. When an error occurs, the
	 * error event is fired with the error information.
	 * @see http://www.nczonline.net/blog/2009/04/28/javascript-error-handling-anti-pattern/
	 * @param {Object} object Any object whose public methods should be wrapped.
	 * @param {string} objectName The name that should be reported for the object
	 *                            when an error occurs.
	 * @returns {void}
	 * @private
	 */
	function captureObjectErrors(object, objectName){

		var propertyName,
			propertyValue;

		for (propertyName in object){
			propertyValue = object[propertyName];

			// only do this for methods, be sure to check before making changes!
			if (typeof propertyValue === 'function'){

				/*
				 * This creates a new function that wraps the original function
				 * in a try-catch. The outer function executes immediately with
				 * the name and actual method passed in as values. This allows
				 * us to create a function with specific information even though
				 * it's inside of a loop.
				 */
				// jshint loopfunc: true
				object[propertyName] = (function(methodName, method){
					return function(){
						try {
							return method.apply(this, arguments);
						} catch (ex) {
							ex.name = objectName + '.' + methodName + '() - ' + ex.name;
							error(ex);
						}
					};

				}(propertyName, propertyValue));
			}
		}
	}

	/**
	 * Returns the name of the module associated with a DOM element
	 * @param {HTMLElement} element DOM element associated with the module
	 * @returns {string} Name of the module (empty if not a module)
	 * @private
	 */
	function getModuleName(element) {
		var moduleDeclaration = $(element).data('module');

		if (moduleDeclaration) {
			return moduleDeclaration.split(' ')[0];
		}
		return '';
	}

	/**
	 * Calls a method on an object if it exists
	 * @param {Box.Application~ModuleInstance} instance Module object to call the method on.
	 * @param {string} method Name of method
	 * @param {...*} [args] Any additional arguments are passed as function parameters (Optional)
	 * @returns {void}
	 * @private
	 */
	function callModuleMethod(instance, method) {
		if (typeof instance[method] === 'function') {
			// Getting the rest of the parameters (the ones other than instance and method)
			instance[method].apply(instance, Array.prototype.slice.call(arguments, 2));
		}
	}

	/**
	 * Returns the requested service
	 * @param {string} serviceName The name of the service to retrieve.
	 * @returns {!Object} An object if the service is found or null if not.
	 * @private
	 */
	function getService(serviceName) {
		var serviceData = services[serviceName];

		if (serviceData) {
			if (!serviceData.instance) {
				serviceData.instance = serviceData.creator(application);
			}

			return serviceData.instance;
		}

		return null;
	}

	/**
	 * Gets the behaviors associated with a particular module
	 * @param {Box.Application~ModuleInstanceData} instanceData Module with behaviors
	 * @returns {Array} Array of behavior instances
	 * @private
	 */
	function getBehaviors(instanceData) {
		var i,
			behaviorNames,
			behaviorData,
			behaviorInstances = [],
			moduleBehaviorInstances;

		behaviorNames = instanceData.instance.behaviors || [];
		for (i = 0; i < behaviorNames.length; i++) {
			if (!('behaviorInstances' in instanceData)) {
				instanceData.behaviorInstances = {};
			}
			moduleBehaviorInstances = instanceData.behaviorInstances;
			behaviorData = behaviors[behaviorNames[i]];

			if (behaviorData) {
				if (!moduleBehaviorInstances[behaviorNames[i]]) {
					moduleBehaviorInstances[behaviorNames[i]] = behaviorData.creator(instanceData.context);
				}
				behaviorInstances.push(moduleBehaviorInstances[behaviorNames[i]]);
			} else {
				var exception = new Error('Behavior "' + behaviorNames[i] + '" not found');
				error(exception);
			}
		}

		return behaviorInstances;
	}

	/**
	 * Finds the closest ancestor that of an element that has a data-type
	 * attribute.
	 * @param {HTMLElement} element The element to start searching from.
	 * @returns {HTMLElement} The matching element or null if not found.
	 */
	function getNearestTypeElement(element) {
		var $element = $(element),
			found = $element.is('[data-type]');

		while (!found && $element.length && !$element.hasClass('module')) {
			$element = $element.parent();
			found = $element.is('[data-type]');
		}

		return found ? $element[0] : null;
	}

	/**
	 * Binds a user event to a DOM element with the given handler
	 * @param {HTMLElement} element DOM element to bind the event to
	 * @param {string} type Event type (click, mouseover, ...)
	 * @param {Function[]} handlers Array of event callbacks to be called in that order
	 * @returns {void}
	 * @private
	 */
	function bindEventType(element, type, handlers) {
		var eventHandler = function(event) {

			var targetElement = getNearestTypeElement(event.target),
				elementType = targetElement ? targetElement.getAttribute('data-type') : '';

			for (var i = 0; i < handlers.length; i++) {
				handlers[i](event, targetElement, elementType);
			}

			return true;
		};

		$(element).on(type, eventHandler);

		return eventHandler;
	}

	/**
	 * Binds the user events listed in the module to its toplevel element
	 * @param {Box.Application~ModuleInstanceData} instanceData Events will be bound to the module defined in the Instance object
	 * @returns {void}
	 * @private
	 */
	function bindEventListeners(instanceData) {
		var i,
			j,
			type,
			eventHandlerName,
			eventHandlerFunctions,
			behaviors = getBehaviors(instanceData);

		for (i = 0; i < eventTypes.length; i++) {
			eventHandlerFunctions = [];

			type = eventTypes[i];
			eventHandlerName = 'on' + type;

			// Module's event handler gets called first
			if (instanceData.instance[eventHandlerName]) {
				eventHandlerFunctions.push($.proxy(instanceData.instance[eventHandlerName], instanceData.instance));
			}

			// And then all of its behaviors in the order they were declared
			for (j = 0; j < behaviors.length; j++) {
				if (behaviors[j][eventHandlerName]) {
					eventHandlerFunctions.push($.proxy(behaviors[j][eventHandlerName], behaviors[j]));
				}
			}

			if (eventHandlerFunctions.length) {
				instanceData.eventHandlers[type] = bindEventType(instanceData.element, type, eventHandlerFunctions);
			}
		}
	}

	/**
	 * Unbinds the user events listed in the module
	 * @param {Box.Application~ModuleInstanceData} instanceData Events will be unbound from the module defined in the Instance object
	 * @returns {void}
	 * @private
	 */
	function unbindEventListeners(instanceData) {
		for (var type in instanceData.eventHandlers) {
			$(instanceData.element).off(type, instanceData.eventHandlers[type]);
		}

		instanceData.eventHandlers = {};
	}

	/**
	 * Gets the module instance associated with a DOM element
	 * @param {HTMLElement} element DOM element associated with module
	 * @returns {Box.Application~ModuleInstance} Instance object of the module (undefined if not found)
	 * @private
	 */
	function getInstanceDataByElement(element) {
		return instances[element.id];
	}

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	/** @lends Box.Application */
	return $.extend(application, {

		//----------------------------------------------------------------------
		// Application Lifecycle
		//----------------------------------------------------------------------

		/**
		 * Initializes the application
		 * @param {Object} [params] Configuration object
		 * @returns {void}
		 */
		init: function(params) {
			$.extend(globalConfig, params || {});

			this.startAll(document.documentElement);

			this.fire('init');
			initialized = true;
		},

		/**
		 * Stops all modules and clears all saved state
		 * @returns {void}
		 */
		destroy: function() {
			this.stopAll(document.documentElement);

			reset();
		},

		//----------------------------------------------------------------------
		// Module Lifecycle
		//----------------------------------------------------------------------

		/**
		 * Determines if a module represented by the HTML element is started.
		 * If the element doesn't have a data-module attribute, this method
		 * always returns false.
		 * @param {HTMLElement} element The element that represents a module.
		 * @returns {Boolean} True if the module is started, false if not.
		 */
		isStarted: function(element) {
			var instanceData = getInstanceDataByElement(element);
			return (typeof instanceData === 'object');
		},

		/**
		 * Begins the lifecycle of a module (registers and binds listeners)
		 * @param {HTMLElement} element DOM element associated with module to be started
		 * @returns {void}
		 */
		start: function(element) {
			var moduleName = getModuleName(element),
				moduleData = modules[moduleName],
				instanceData,
				context,
				module;

			if (!moduleData) {
				var exception = new Error('Module type "' + moduleName + '" is not defined.');
				error(exception);
				return;
			}

			if (!this.isStarted(element)) {
				// Auto-assign module id to element
				if (!element.id) {
					element.id = 'mod-' + moduleName + '-' + moduleData.counter;
				}

				moduleData.counter++;

				context = new Box.Context(this, element);

				module = moduleData.creator(context);

				// Prevent errors from showing the browser, fire event instead
				if (!globalConfig.debug) {
					captureObjectErrors(module, moduleName);
				}

				instanceData = {
					moduleName: moduleName,
					instance: module,
					context: context,
					element: element,
					eventHandlers: {}
				};

				bindEventListeners(instanceData);

				instances[element.id] = instanceData;

				callModuleMethod(instanceData.instance, 'init');

				var behaviors = getBehaviors(instanceData),
					behaviorInstance;

				for (var i = 0, len = behaviors.length; i < len; i++) {
					behaviorInstance = behaviors[i];
					callModuleMethod(behaviorInstance, 'init');
				}

			}
		},

		/**
		 * Ends the lifecycle of a module (unregisters and unbinds listeners)
		 * @param {HTMLElement} element DOM element associated with module to be stopped
		 * @returns {void}
		 */
		stop: function(element) {
			var instanceData = getInstanceDataByElement(element),
				moduleName,
				moduleData;

			if (!instanceData) {

				if (globalConfig.debug) {
					var exception = new Error('Unable to stop module associated with element: ' + element.id);
					error(exception);
					return;
				}

			} else {

				moduleName = instanceData.moduleName;
				moduleData = modules[moduleName];

				unbindEventListeners(instanceData);

				// Call these in reverse order
				var behaviors = getBehaviors(instanceData);
				var behaviorInstance;
				for (var i = behaviors.length - 1; i >= 0; i--) {
					behaviorInstance = behaviors[i];
					callModuleMethod(behaviorInstance, 'destroy');
				}

				callModuleMethod(instanceData.instance, 'destroy');

				delete instances[element.id];
			}
		},

		/**
		 * Starts all modules contained within an element
		 * @param {HTMLElement} root DOM element which contains modules
		 * @returns {void}
		 */
		startAll: function(root) {
			var me = this,
				$root = $(root);

			$root.find(MODULE_CLASS_SELECTOR).each(function(idx, element) {
				me.start(element);
			});
		},

		/**
		 * Stops all modules contained within an element
		 * @param {HTMLElement} root DOM element which contains modules
		 * @returns {void}
		 */
		stopAll: function(root) {
			var me = this,
				$root = $(root);

			$root.find(MODULE_CLASS_SELECTOR).each(function(idx, element) {
				me.stop(element);
			});
		},

		//----------------------------------------------------------------------
		// Module-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new module
		 * @param {string} moduleName Unique module identifier
		 * @param {Function} creator Factory function used to generate the module
		 * @returns {void}
		 */
		addModule: function(moduleName, creator) {
			if (typeof modules[moduleName] !== 'undefined') {
				var exception = new Error('Module ' + moduleName + ' has already been added.');
				error(exception);
				return;
			}

			modules[moduleName] = {
				creator: creator,
				counter: 1 // increments for each new instance
			};
		},

		/**
		 * Returns any configuration information that was output into the page
		 * for this instance of the module.
		 * @param {HTMLElement} element The HTML element associated with a module.
		 * @param {string} [name] Specific config parameter
		 * @returns {any} config value or the entire configuration JSON object
		 *                if no name is specified (null if either not found)
		 */
		getModuleConfig: function(element, name) {

			var instanceData = getInstanceDataByElement(element),
				configElement;

			if (instanceData) {

				if (!instanceData.config) {
					// <script type="text/x-config"> is used to store JSON data
					configElement = $(element).find('script[type="text/x-config"]')[0];

					// <script> tag supports .text property
					if (configElement) {
						instanceData.config = $.parseJSON(configElement.text);
					}
				}

				if (!instanceData.config) {
					return null;
				} else if (typeof name === 'undefined') {
					return instanceData.config;
				} else if (name in instanceData.config) {
					return instanceData.config[name];
				} else {
					return null;
				}
			}

			return null;
		},

		//----------------------------------------------------------------------
		// Service-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new service
		 * @param {string} serviceName Unique service identifier
		 * @param {Function} creator Factory function used to generate the service
		 * @param {Object} [options]
		 * @param {string[]} [options.exports] Method names to expose on context and application
		 * @returns {void}
		 */
		addService: function(serviceName, creator, options) {

			var exception = new Error();

			if (typeof services[serviceName] !== 'undefined') {
				exception.name = 'Service ' + serviceName + ' has already been added.';
				error(exception);
				return;
			}

			options = options || {};

			services[serviceName] = {
				creator: creator,
				instance: null
			};

			if (options.exports) {

				for (var i = 0; i < options.exports.length; i++) {

					var methodName = options.exports[i];

					// jshint loopfunc: true
					var handler = (function(methodName) {
						return function() {
							var service = getService(serviceName);
							return service[methodName].apply(service, arguments);
						};
					}(methodName));

					if (methodName in this) {
						exception.name = methodName + ' already exists on Application object';
						error(exception);
						return;
					} else {
						this[methodName] = handler;
					}

					if (methodName in Box.Context.prototype) {
						exception.name = methodName + ' already exists on Context prototype';
						error(exception);
						return;
					} else {
						Box.Context.prototype[methodName] = handler;
					}

					exports.push(methodName);
				}
			}
		},

		/**
		 * Returns the requested service
		 * @param {string} serviceName The name of the service to retrieve.
		 * @returns {!Object} An object if the service is found or null if not.
		 */
		getService: getService,


		//----------------------------------------------------------------------
		// Behavior-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new behavior
		 * @param {string} behaviorName Unique behavior identifier
		 * @param {Function} creator Factory function used to generate the behavior
		 * @returns {void}
		 */
		addBehavior: function(behaviorName, creator) {
			if (typeof behaviors[behaviorName] !== 'undefined') {
				var exception = new Error('Behavior ' + behaviorName + ' has already been added.');
				error(exception);
				return;
			}

			behaviors[behaviorName] = {
				creator: creator,
				instance: null
			};
		},

		//----------------------------------------------------------------------
		// Messaging
		//----------------------------------------------------------------------

		/**
		 * Broadcasts a message to all registered listeners
		 * @param {string} name Name of the message
		 * @param {any} [data] Custom parameters for the message
		 * @returns {void}
		 */
		broadcast: function(name, data) {
			var i,
				id,
				instanceData,
				behaviorInstance,
				behaviors,
				messageHandlers;

			for (id in instances) {
				messageHandlers = [];
				instanceData = instances[id];

				// Module message handler is called first
				if ($.inArray(name, instanceData.instance.messages || []) !== -1) {
					messageHandlers.push($.proxy(instanceData.instance.onmessage, instanceData.instance));
				}

				// And then any message handlers defined in module's behaviors
				behaviors = getBehaviors(instanceData);
				for (i = 0; i < behaviors.length; i++) {
					behaviorInstance = behaviors[i];

					if ($.inArray(name, behaviorInstance.messages || []) !== -1) {
						messageHandlers.push($.proxy(behaviorInstance.onmessage, behaviorInstance));
					}
				}

				for (i = 0; i < messageHandlers.length; i++) {
					messageHandlers[i](name, data);
				}
			}
		},

		//----------------------------------------------------------------------
		// Global Configuration
		//----------------------------------------------------------------------

		/**
		 * Returns global configuration data
		 * @param {string} [name] Specific config parameter
		 * @returns {any} config value or the entire configuration JSON object
		 *                if no name is specified (null if neither not found)
		 */
		getGlobalConfig: function(name) {
			if (typeof name === 'undefined') {
				return globalConfig;
			} else if (name in globalConfig) {
				return globalConfig[name];
			} else {
				return null;
			}
		},

		/**
		 * Sets the global configuration data
		 * @param {Object} config Global configuration object
		 * @returns {void}
		 */
		setGlobalConfig: function(config) {
			if (initialized) {
				var exception = new Error('Cannot set global configuration after application initialization');
				error(exception);
				return;
			}

			for (var prop in config) {
				if (config.hasOwnProperty(prop)) {
					globalConfig[prop] = config[prop];
				}
			}
		},

		//----------------------------------------------------------------------
		// Error reporting
		//----------------------------------------------------------------------

		/**
		 * Signals that an error has occurred. If in development mode, an error
		 * is thrown. If in production mode, an event is fired.
		 * @param {Error} [exception] The exception object to use.
		 * @returns {void}
		 */
		reportError: error
	});

}());
