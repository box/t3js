/**
 * @fileoverview Contains the Context type which is used by modules to interact
 *               with the environment.
 * @author Box
 */

/**
 * The object type that modules use to interact with the environment. Used
 * exclusively within Box.Application, but exposed publicly for easy testing.
 * @param {Box.Application} application The application object to wrap.
 * @param {HTMLElement} element Module's DOM element
 * @constructor
 */
Box.Context = function(application, element) {

	'use strict';

	//-------------------------------------------------------------------------
	// Passthrough Methods
	//-------------------------------------------------------------------------

	/**
	 * Passthrough method to application that broadcasts messages.
	 * @param {string} name Name of the message event
	 * @param {any} [data] Custom parameters for the message
	 * @returns {void}
	 */
	this.broadcast = function(name, data) {
		application.broadcast(name, data);
	};

	/**
	 * Passthrough method to application that retrieves services.
	 * @param {string} serviceName The name of the service to retrieve.
	 * @returns {Object|null} An object if the service is found or null if not.
	 */
	this.getService = function(serviceName) {
		return application.getService(serviceName);
	};

	/**
	 * Returns any configuration information that was output into the page
	 * for this instance of the module.
	 * @param {string} [name] Specific config parameter
	 * @returns {any} config value or the entire configuration JSON object
	 *                if no name is specified (null if either not found)
	 */
	this.getConfig = function(name) {
		return application.getModuleConfig(element, name);
	};

	/**
	 * Returns global configuration data
	 * @param {string} [name] Specific config parameter
	 * @returns {any} config value or the entire configuration JSON object
	 *                if no name is specified (null if either not found)
	 */
	this.getGlobalConfig = function(name) {
		return application.getGlobalConfig(name);
	};

	//-------------------------------------------------------------------------
	// Service Shortcuts
	//-------------------------------------------------------------------------

	/**
	 * Returns the element that represents the module.
	 * @returns {HTMLElement} The element representing the module.
	 */
	this.getElement = function() {
		return element;
	};

};

