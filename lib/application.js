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

	var MODULE_SELECTOR = '[data-module]';

	var globalConfig = {},   // Global configuration
		modules = {},        // Information about each registered module by moduleName
		serviceStack = [],   // Track circular dependencies while loading services
		services = {},       // Information about each registered service by serviceName
		behaviors = {},      // Information about each registered behavior by behaviorName
		instances = {},      // Module instances keyed by DOM element id
		initialized = false, // Flag whether the application has been initialized
		customErrorHandler = null,

		application = new Box.EventTarget();	// base object for application

	/**
	 * Simple implementation of ES6 Object.assign() with just two parameters.
	 * @param {Object} receiver The object to receive properties
	 * @param {Object} supplier The object whose properties should be copied.
	 * @returns {Object} The receiver object.
	 * @private
	 */
	function assign(receiver, supplier) {

		for (var prop in supplier) {
			if (supplier.hasOwnProperty(prop)) {
				receiver[prop] = supplier[prop];
			}
		}

		return receiver;
	}

	/**
	 * Simple implementation of Array.prototype.indexOf().
	 * @param {*[]} items An array of items to search.
	 * @param {*} item The item to search for in the array.
	 * @returns {int} The index of the item in the array if found, -1 if not found.
	 * @private
	 */
	function indexOf(items, item) {
		for (var i = 0, len = items.length; i < len; i++) {
			if (items[i] === item) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Reset all state to its default values
	 * @returns {void}
	 * @private
	 */
	function reset() {
		globalConfig = {};
		modules = {};
		services = {};
		serviceStack = [];
		behaviors = {};
		instances = {};
		initialized = false;
	}


	/**
	 * Indicates if a given service is being instantiated. This is used to check
	 * for circular dependencies in service instantiation. If two services
	 * reference each other, it causes a stack overflow and is really hard to
	 * track down, so we provide an extra check to make finding this issue
	 * easier.
	 * @param {string} serviceName The name of the service to check.
	 * @returns {boolean} True if the service is already being instantiated,
	 *		false if not.
	 * @private
	 */
	function isServiceBeingInstantiated(serviceName) {
		for (var i = 0, len = serviceStack.length; i < len; i++) {
			if (serviceStack[i] === serviceName) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Signals that an error has occurred. If in development mode, an error
	 * is thrown. If in production mode, an event is fired.
	 * @param {Error} [exception] The exception object to use.
	 * @returns {void}
	 * @private
	 */
	function error(exception) {
		if (typeof customErrorHandler === 'function') {
			customErrorHandler(exception);
			return;
		}
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
	function captureObjectErrors(object, objectName) {

		var propertyName,
			propertyValue;

		/* eslint-disable guard-for-in, no-loop-func */
		for (propertyName in object) {
			propertyValue = object[propertyName];

			// only do this for methods, be sure to check before making changes!
			if (typeof propertyValue === 'function') {
				/*
				 * This creates a new function that wraps the original function
				 * in a try-catch. The outer function executes immediately with
				 * the name and actual method passed in as values. This allows
				 * us to create a function with specific information even though
				 * it's inside of a loop.
				 */
				object[propertyName] = (function(methodName, method) {
					return function() {
						var errorPrefix = objectName + '.' + methodName + '() - ';
						try {
							return method.apply(this, arguments);
						} catch (ex) {
							ex.methodName = methodName;
							ex.objectName = objectName;
							ex.name = errorPrefix + ex.name;
							ex.message = errorPrefix + ex.message;
							error(ex);
						}
					};

				}(propertyName, propertyValue));
			}
		}
		/* eslint-enable guard-for-in, no-loop-func */
	}

	/**
	 * Returns the name of the module associated with a DOM element
	 * @param {HTMLElement} element DOM element associated with the module
	 * @returns {string} Name of the module (empty if not a module)
	 * @private
	 */
	function getModuleName(element) {
		var moduleAttribute = element.getAttribute('data-module');

		if (moduleAttribute) {
			return moduleAttribute.split(' ')[0];
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
	 * @returns {Object} An object if the service
	 * @throws {Error} If service does not exist or there is a circular dependency
	 * @private
	 */
	function getService(serviceName) {

		var serviceData = services[serviceName];

		if (serviceData) {

			if (!serviceData.instance) {
				// check for circular dependencies
				if (isServiceBeingInstantiated(serviceName)) {
					error(new ReferenceError('Circular service dependency: ' + serviceStack.join(' -> ') + ' -> ' + serviceName));
					return null;
				}

				// flag that this service is being initialized just in case there's a circular dependency issue
				serviceStack.push(serviceName);

				serviceData.instance = serviceData.creator(application);

				// no error was thrown for circular dependencies, so we're done
				serviceStack.pop();
			}

			return serviceData.instance;
		} else {
			error(new Error('Service "' + serviceName + '" not found'));
		}

		return null;
	}

	/**
	 * Gets the behaviors associated with a particular module
	 * @param {Box.Application~ModuleInstanceData} instanceData Module with behaviors
	 * @returns {Array} Array of behavior instances
	 * @throws {Error} If behavior does not exist
	 * @private
	 */
	function getBehaviors(instanceData) {
		var i,
			behaviorNames,
			behaviorData,
			behaviorInstances = [],
			includedBehaviors = {}, // Used to de-dupe behaviors
			moduleBehaviorInstances,
			behaviorName;

		behaviorNames = instanceData.instance.behaviors || [];

		for (i = 0; i < behaviorNames.length; i++) {
			behaviorName = behaviorNames[i];

			if (!('behaviorInstances' in instanceData)) {
				instanceData.behaviorInstances = {};
			}

			moduleBehaviorInstances = instanceData.behaviorInstances;
			behaviorData = behaviors[behaviorName];

			// First make sure we haven't already included this behavior for this module
			if (behaviorName in includedBehaviors) {
				error(new Error('Behavior "' + behaviorName + '" cannot be specified twice in a module.'));
			} else if (behaviorData) {

				if (!moduleBehaviorInstances[behaviorName]) {
					moduleBehaviorInstances[behaviorName] = behaviorData.creator(instanceData.context);
				}

				behaviorInstances.push(moduleBehaviorInstances[behaviorName]);
			} else {
				error(new Error('Behavior "' + behaviorName + '" not found'));
			}

			// Track which behaviors are included so we can catch duplicates
			includedBehaviors[behaviorName] = true;
		}

		return behaviorInstances;
	}

	/**
	 * Creates a new event delegate and sets up its event handlers.
	 * @param {Array} eventDelegates The array of event delegates to add to.
	 * @param {HTMLElement} element The HTML element to bind to.
	 * @param {Object} handler The handler object for the delegate (either the
	 *		module instance or behavior instance).
	 * @returns {void}
	 * @private
	 */
	function createAndBindEventDelegate(eventDelegates, element, handler) {
		var delegate = new Box.DOMEventDelegate(element, handler, globalConfig.eventTypes);
		eventDelegates.push(delegate);
		delegate.attachEvents();
	}

	/**
	 * Binds the user events listed in the module to its toplevel element
	 * @param {Box.Application~ModuleInstanceData} instanceData Events will be bound to the module defined in the Instance object
	 * @returns {void}
	 * @private
	 */
	function bindEventListeners(instanceData) {
		var eventDelegates = instanceData.eventDelegates,
			moduleBehaviors = getBehaviors(instanceData);

		// bind the module events
		createAndBindEventDelegate(eventDelegates, instanceData.element, instanceData.instance);

		// bind the behavior(s) events
		for (var i = 0; i < moduleBehaviors.length; i++) {
			createAndBindEventDelegate(eventDelegates, instanceData.element, moduleBehaviors[i]);
		}
	}

	/**
	 * Unbinds the user events listed in the module
	 * @param {Box.Application~ModuleInstanceData} instanceData Events will be unbound from the module defined in the Instance object
	 * @returns {void}
	 * @private
	 */
	function unbindEventListeners(instanceData) {

		var eventDelegates = instanceData.eventDelegates;

		for (var i = 0; i < eventDelegates.length; i++) {
			eventDelegates[i].detachEvents();
		}

		instanceData.eventDelegates = [];
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

	/**
	 * Gets message handlers from the provided module instance
	 * @param {Box.Application~ModuleInstance|Box.Application~BehaviorInstance} instance Messages handlers will be retrieved from the Instance object
	 * @param {String} name The name of the message to be handled
	 * @param {Any} data A playload to be passed to the message handler
	 * @returns {void}
	 * @private
	 */
	function callMessageHandler(instance, name, data) {

		// If onmessage is an object call message handler with the matching key (if any)
		if (instance.onmessage !== null && typeof instance.onmessage === 'object' && instance.onmessage.hasOwnProperty(name)) {
			instance.onmessage[name].call(instance, data);

		// Otherwise if message name exists in messages call onmessage with name, data
		} else if (indexOf(instance.messages || [], name) !== -1) {
			instance.onmessage.call(instance, name, data);
		}
	}

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	/** @lends Box.Application */
	return assign(application, {

		//----------------------------------------------------------------------
		// Application Lifecycle
		//----------------------------------------------------------------------

		/**
		 * Initializes the application
		 * @param {Object} [params] Configuration object
		 * @returns {Box.Application} The application object.
		 */
		init: function(params) {
			assign(globalConfig, params || {});

			this.startAll(document.documentElement);

			this.fire('init');
			initialized = true;
			return this;
		},

		/**
		 * Stops all modules and clears all saved state
		 * @returns {Box.Application} The application object.
		 */
		destroy: function() {
			this.stopAll(document.documentElement);

			reset();

			return this;
		},

		//----------------------------------------------------------------------
		// Module Lifecycle
		//----------------------------------------------------------------------

		/**
		 * Determines if a module represented by the HTML element is started.
		 * If the element doesn't have a data-module attribute, this method
		 * always returns false.
		 * @param {HTMLElement} element The element that represents a module.
		 * @returns {boolean} True if the module is started, false if not.
		 */
		isStarted: function(element) {
			var instanceData = getInstanceDataByElement(element);
			return typeof instanceData === 'object';
		},

		/**
		 * Begins the lifecycle of a module (registers and binds listeners)
		 * @param {HTMLElement} element DOM element associated with module to be started
		 * @returns {Box.Application} The application object.
		 * @throws {Error} If a module being started is not defined
		 */
		start: function(element) {
			var moduleName = getModuleName(element),
				moduleData = modules[moduleName],
				instanceData,
				context,
				module;

			if (!moduleData) {
				error(new Error('Module type "' + moduleName + '" is not defined.'));
				return this;
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
					eventDelegates: []
				};

				instances[element.id] = instanceData;

				var moduleBehaviors = getBehaviors(instanceData),
					behaviorInstance;

				for (var i = 0, len = moduleBehaviors.length; i < len; i++) {
					behaviorInstance = moduleBehaviors[i];
					callModuleMethod(behaviorInstance, 'init');
				}

				// Initialize module only after behaviors are initialized
				callModuleMethod(instanceData.instance, 'init');

				// Bind events after initialization is complete to avoid event timing issues
				bindEventListeners(instanceData);

			}

			return this;
		},

		/**
		 * Ends the lifecycle of a module (unregisters and unbinds listeners)
		 * @param {HTMLElement} element DOM element associated with module to be stopped
		 * @returns {Box.Application} The application object.
		 * @throws {Error} If a module being stopped doesn't exist
		 */
		stop: function(element) {
			var instanceData = getInstanceDataByElement(element);

			if (!instanceData) {

				if (globalConfig.debug) {
					error(new Error('Unable to stop module associated with element: ' + element.id));
					return this;
				}

			} else {

				unbindEventListeners(instanceData);

				// Call these in reverse order
				var moduleBehaviors = getBehaviors(instanceData);
				var behaviorInstance;
				for (var i = moduleBehaviors.length - 1; i >= 0; i--) {
					behaviorInstance = moduleBehaviors[i];
					callModuleMethod(behaviorInstance, 'destroy');
				}

				callModuleMethod(instanceData.instance, 'destroy');

				delete instances[element.id];
			}

			return this;
		},

		/**
		 * Starts all modules contained within an element
		 * @param {HTMLElement} root DOM element which contains modules
		 * @returns {Box.Application} The application object.
		 */
		startAll: function(root) {
			var moduleElements = Box.DOM.queryAll(root, MODULE_SELECTOR);

			for (var i = 0, len = moduleElements.length; i < len; i++) {
				this.start(moduleElements[i]);
			}

			return this;
		},

		/**
		 * Stops all modules contained within an element
		 * @param {HTMLElement} root DOM element which contains modules
		 * @returns {Box.Application} The application object.
		 */
		stopAll: function(root) {
			var moduleElements = Box.DOM.queryAll(root, MODULE_SELECTOR);

			for (var i = 0, len = moduleElements.length; i < len; i++) {
				this.stop(moduleElements[i]);
			}

			return this;
		},

		//----------------------------------------------------------------------
		// Module-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new module
		 * @param {string} moduleName Unique module identifier
		 * @param {Function} creator Factory function used to generate the module
		 * @returns {Box.Application} The application object.
		 * @throws {Error} If a module has already been added
		 */
		addModule: function(moduleName, creator) {
			if (typeof modules[moduleName] !== 'undefined') {
				error(new Error('Module ' + moduleName + ' has already been added.'));
				return this;
			}

			modules[moduleName] = {
				creator: creator,
				counter: 1 // increments for each new instance
			};

			return this;
		},

		/**
		 * Checks if a module exists
		 * @param {string} moduleName The name of the module to check.
		 * @returns {boolean} True, if module exist. False, otherwise.
		 */
		hasModule: function(moduleName) {
			return (typeof modules[moduleName] !== 'undefined');
		},

		/**
		 * Returns any configuration information that was output into the page
		 * for this instance of the module.
		 * @param {HTMLElement} element The HTML element associated with a module.
		 * @param {string} [name] Specific config parameter
		 * @returns {*} config value or the entire configuration JSON object
		 *                if no name is specified (null if either not found)
		 */
		getModuleConfig: function(element, name) {

			var instanceData = getInstanceDataByElement(element);
			var moduleConfig = null;

			if (instanceData && instanceData.config) {
				// Check if we've already read the configurations before
				moduleConfig = instanceData.config;
			} else {
				// Read the special script element that stores module configuration in the markup
				var configElement = Box.DOM.query(element, 'script[type="text/x-config"]');

				// <script> tag supports .text property
				if (configElement) {
					try {
						moduleConfig = JSON.parse(configElement.text);
					} catch (exception) {
						error(new Error('Module with id ' + element.id + ' has a malformed config.'));
					}
				}

				// Cache the configurations for performance, if the module instance has been created
				if (instanceData) {
					instanceData.config = moduleConfig;
				}
			}

			if (!moduleConfig) {
				return null;
			} else if (typeof name === 'undefined') {
				return moduleConfig;
			} else if (name in moduleConfig) {
				return moduleConfig[name];
			} else {
				return null;
			}

		},

		//----------------------------------------------------------------------
		// Service-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new service
		 * @param {string} serviceName Unique service identifier
		 * @param {Function} creator Factory function used to generate the service
		 * @returns {Box.Application} The application object.
		 * @throws {Error} If a service has already been added
		 */
		addService: function(serviceName, creator) {

			if (typeof services[serviceName] !== 'undefined') {
				error(new Error('Service ' + serviceName + ' has already been added.'));
				return this;
			}

			services[serviceName] = {
				creator: creator,
				instance: null
			};

			return this;
		},

		/**
		 * Returns the requested service
		 * @param {string} serviceName The name of the service to retrieve.
		 * @returns {!Object} An object if the service is found or null if not.
		 */
		getService: getService,

		/**
		 * Checks if a service exists
		 * @param {string} serviceName The name of the service to check.
		 * @returns {boolean} True, if service exist. False, otherwise.
		 */
		hasService: function(serviceName) {
			return services.hasOwnProperty(serviceName);
		},

		//----------------------------------------------------------------------
		// Behavior-Related
		//----------------------------------------------------------------------

		/**
		 * Registers a new behavior
		 * @param {string} behaviorName Unique behavior identifier
		 * @param {Function} creator Factory function used to generate the behavior
		 * @returns {Box.Application} The application object.
		 * @throws {Error} If a behavior has already been added
		 */
		addBehavior: function(behaviorName, creator) {
			if (typeof behaviors[behaviorName] !== 'undefined') {
				error(new Error('Behavior ' + behaviorName + ' has already been added.'));
				return this;
			}

			behaviors[behaviorName] = {
				creator: creator,
				instance: null
			};

			return this;
		},

		//----------------------------------------------------------------------
		// Messaging
		//----------------------------------------------------------------------

		/**
		 * Broadcasts a message to all registered listeners
		 * @param {string} name Name of the message
		 * @param {*} [data] Custom parameters for the message
		 * @returns {Box.Application} The application object.
		 */
		broadcast: function(name, data) {
			var i,
				id,
				instanceData,
				behaviorInstance,
				moduleBehaviors;

			for (id in instances) {

				if (instances.hasOwnProperty(id)) {
					instanceData = instances[id];

					// Module message handler is called first
					callMessageHandler(instanceData.instance, name, data);

					// And then any message handlers defined in module's behaviors
					moduleBehaviors = getBehaviors(instanceData);
					for (i = 0; i < moduleBehaviors.length; i++) {
						behaviorInstance = moduleBehaviors[i];
						callMessageHandler(behaviorInstance, name, data);
					}
				}

			}

			// also fire an event so non-T3 code can listen for the message
			this.fire('message', {
				message: name,
				messageData: data
			});

			return this;
		},

		//----------------------------------------------------------------------
		// Global Configuration
		//----------------------------------------------------------------------

		/**
		 * Returns a global variable
		 * @param {string} name Specific global var name
		 * @returns {*} returns the window-scope variable matching the name, null otherwise
		 */
		getGlobal: function(name) {
			if (name in window) {
				return window[name];
			} else {
				return null;
			}
		},

		/**
		 * Returns global configuration data
		 * @param {string} [name] Specific config parameter
		 * @returns {*} config value or the entire configuration JSON object
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
		 * @returns {Box.Application} The application object.
		 */
		setGlobalConfig: function(config) {
			if (initialized) {
				error(new Error('Cannot set global configuration after application initialization'));
				return this;
			}

			assign(globalConfig, config);
			return this;
		},

		//----------------------------------------------------------------------
		// Error reporting
		//----------------------------------------------------------------------

		/**
		 * Overrides default error handler
		 * @param {Function} exceptionHandler handling function that takes an
		 * exception as argument. Must be called before init.
		 * @returns {void}
		 */
		setErrorHandler: function(exceptionHandler) {
			customErrorHandler = exceptionHandler;
		},

		/**
		 * Signals that an error has occurred. If in development mode, an error
		 * is thrown. If in production mode, an event is fired.
		 * @param {Error} [exception] The exception object to use.
		 * @returns {void}
		 */
		reportError: error,

		/**
		 * Signals that an warning has occurred.
		 * If in development mode, console.warn is invoked.
		 * If in production mode, an event is fired.
		 * @param {*} data A message string or arbitrary data
		 * @returns {void}
		 */
		reportWarning: function(data) {
			if (globalConfig.debug) {
				// We grab console via getGlobal() so we can stub it out in tests
				var globalConsole = this.getGlobal('console');
				if (globalConsole && globalConsole.warn) {
					globalConsole.warn(data);
				}
			} else {
				application.fire('warning', data);
			}
		},

		/**
		 * Display console info messages.
		 * If in development mode, console.info is invoked.
		 * @param {*} data A message string or arbitrary data
		 * @returns {void}
		 */
		reportInfo: function(data) {
			if (globalConfig.debug) {
				// We grab console via getGlobal() so we can stub it out in tests
				var globalConsole = this.getGlobal('console');
				if (globalConsole && globalConsole.info) {
					globalConsole.info(data);
				}
			}
		}

	});

}());
