/**
 * @fileoverview Contains the Context type which is used by modules to interact
 *               with the environment.
 * @author Box
 */

Box.Context = (function() {

	'use strict';

	/**
	 * The object type that modules use to interact with the environment. Used
	 * exclusively within Box.Application, but exposed publicly for easy testing.
	 * @param {Box.Application} application The application object to wrap.
	 * @param {HTMLElement} element Module's DOM element
	 * @constructor
	 */
	var Context = function(application, element) {
		this.application = application;
		this.element = element;
	};

	//-------------------------------------------------------------------------
	// Passthrough Methods
	//-------------------------------------------------------------------------

	Context.prototype = {

		/**
		 * Passthrough method to application that broadcasts messages.
		 * @param {string} name Name of the message event
		 * @param {any} [data] Custom parameters for the message
		 * @returns {void}
		 */
		broadcast: function(name, data) {
			this.application.broadcast(name, data);
		},

		/**
		 * Passthrough method to application that retrieves services.
		 * @param {string} serviceName The name of the service to retrieve.
		 * @returns {Object|null} An object if the service is found or null if not.
		 */
		getService: function(serviceName) {
			return this.application.getService(serviceName);
		},

		/**
		 * Returns any configuration information that was output into the page
		 * for this instance of the module.
		 * @param {string} [name] Specific config parameter
		 * @returns {any} config value or the entire configuration JSON object
		 *                if no name is specified (null if either not found)
		 */
		getConfig: function(name) {
			return this.application.getModuleConfig(this.element, name);
		},

		/**
		 * Returns global configuration data
		 * @param {string} [name] Specific config parameter
		 * @returns {any} config value or the entire configuration JSON object
		 *                if no name is specified (null if either not found)
		 */
		getGlobalConfig: function(name) {
			return this.application.getGlobalConfig(name);
		},

		/**
		 * Passthrough method that signals that an error has occurred. If in development mode, an error
		 * is thrown. If in production mode, an event is fired.
		 * @param {String} message The error message.
		 * @param {Error} [exception] The exception object to use.
		 * @returns {void}
		 */
		reportError: function(message, exception) {
			this.application.reportError(message, exception);
		},

		//-------------------------------------------------------------------------
		// Service Shortcuts
		//-------------------------------------------------------------------------

		/**
		 * Returns the element that represents the module.
		 * @returns {HTMLElement} The element representing the module.
		 */
		getElement: function() {
			return this.element;
		}

	};

	return Context;

})();
