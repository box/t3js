/**
 * @fileoverview A page routing service
 * @author Box
 */

/*
 * A router for our objects
 */
Application.addService('router', function(application) {

	'use strict';

	var history = application.getGlobal('history');
	var pageRoutes;

	var regexRoutes = [],
		prevUrl;

	/**
	 * Parses the user-friendly declared routes at the top of the application,
	 * these could be init'ed or passed in from another context to help extract
	 * navigation for T3 from the framework. Populates the regexRoutes variable
	 * that is local to the service.
	 * Regexs and parsing borrowed from Backbone's router since they did it right
	 * and not inclined to make a new router syntax unless we have a reason to.
	 * @returns {void}
	 */
	function parseRoutes() {
		// Regexs to convert a route (/file/:fileId) into a regex
		var optionalParam = /\((.*?)\)/g,
			namedParam    = /(\(\?)?:\w+/g,
			splatParam    = /\*\w+/g,
			escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g,
			namedParamCallback = function(match, optional) {
				return optional ? match : '([^\/]+)';
			},
			route,
			regexRoute;

		for (var i = 0, len = pageRoutes.length; i < len; i++) {
			route = pageRoutes[i];
			regexRoute = route.replace(escapeRegExp, '\\$&')
						.replace(optionalParam, '(?:$1)?')
						.replace(namedParam, namedParamCallback)
						.replace(splatParam, '(.*?)');
			regexRoutes.push(new RegExp('^' + regexRoute + '$'));
		}
	}

	/**
	 * Finds the regex route that matches the current fragment and returns
	 * the matched route. This could eventually map back to the route it was
	 * created from to return a smarter object (ie /file/:fileId returning {fileId: 42})
	 * @param  {string} fragment represents the current "URL" the user is getting to
	 * @return {Object}
	 */
	function matchGlob(fragment) {
		var regexRoute,
			globMatches;

		for (var idx in regexRoutes) {
			regexRoute = regexRoutes[idx];

			if (regexRoute.test(fragment)) {
				globMatches = fragment.match(regexRoute);
			}
		}

		return globMatches;
	}

	/**
	 * Gets the fragment and broadcasts the previous URL and the current URL of
	 * the page, ideally we wouldn't have a dependency on the previous URL...
	 * @param   {string} fragment the current "URL" the user is getting to
	 * @returns {void}
	 */
	function broadcastStateChanged(fragment) {
		var globMatches = matchGlob(fragment);

		if (!!globMatches) {
			application.broadcast('statechanged', {
				url: fragment,
				prevUrl: prevUrl,
				params: globMatches.splice(1) // Get everything after the URL
			});
		}
	}

	return {
		/**
		 * The magical method the application code will call to navigate around,
		 * high level it pushes the state, gets the templates from server, puts
		 * them on the page and broadcasts the statechanged.
		 * @param   {Object} state    the state associated with the URL
		 * @param   {string} title    the title of the page
		 * @param   {string} fragment the current "URL" the user is getting to
		 * @returns {void}
		 */
		route: function(state, title, fragment) {
			prevUrl = history.state.hash;

			// First push the state
			history.pushState(state, title, fragment);

			// Then make the AJAX request
			broadcastStateChanged(fragment);
		},

		/**
		 * Initialization that has to be done when the navigation service is required
		 * by application code, sets up routes (which could be done later) and binds
		 * to the popstate/hashchange events (which have to happen now).
		 * @private
		 * @param {string[]} routes An array of special route strings
		 * @returns {void}
		 */
		init: function(inputRoutes) {
			pageRoutes = inputRoutes || {};

			// Turn the routes globs into regular expressions...
			parseRoutes();

			var me = this;

			// Bind the document click listener to all anchor tags
			$(document).on('click.router', 'a', function(e) {
				// Append the query string to the end of the pathname
				var url = e.target.pathname + e.target.search;

				// Stop the event here and we can handle it
				e.preventDefault();
				e.stopPropagation();

				// Check the hash and the URL and make sure they aren't the same
				// and then navigate (in the case of an anchors href='#')
				if (url !== history.state.hash) {
					me.route({}, '', url);
				}
			});

			window.onpopupstate = function() {
				var state = history.state,
					url = state.hash;

				me.route({}, '', url);
			};

			history.pushState({}, '', application.getGlobal('location').pathname);
		},

		/**
		 * Unbinds the event handlers on the DOM
		 * @returns {void}
		 */
		destroy: function() {
			$(document).off('click.router', 'a');
		}
	};
});

