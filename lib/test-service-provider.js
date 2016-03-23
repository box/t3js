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
		'broadcast', 'getGlobalConfig', 'reportError', 'reportWarning',

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
