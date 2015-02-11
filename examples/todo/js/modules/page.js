/**
 * @fileoverview Page Module
 * @author Box
 */

/*
 * This module only handles routing on the page (via anchor links)
 */
Application.addModule('page', function(context) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

	var routerService;

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

	return {

		/**
		 * Initializes the module. Caches a data store object to todos
		 * @returns {void}
		 */
		init: function() {
			var baseUrl = context.getGlobal('location').pathname;

			routerService = context.getService('router');
			routerService.init([
				baseUrl,
				baseUrl + 'active',
				baseUrl + 'completed'
			]);
		},

		/**
		 * Destroys the module.
		 * @returns {void}
		 */
		destroy: function() {
			routerService.destroy();
		}

	};

});
