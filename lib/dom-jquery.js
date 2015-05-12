/**
 * @fileoverview DOM abstraction to use jquery to add and remove event listeners
 * in T3
 * @author jdivock
 */

Box.JQueryDOM = (function() {
    'use strict';

    return {

		type: 'jquery',

		/**
		 * Returns the first element that is a descendant of the element
		 * on which it is invoked that matches the specified group of selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {HTMLElement} first element found matching query
		 */
		query: function(root, selector) {
			// Aligning with native which returns null if not found
			return $(root).find(selector)[0] || null;
		},

		/**
		 * Returns a non-live NodeList of all elements descended from the
		 * element on which it is invoked that match the specified group of CSS selectors.
		 * @param {HTMLElement} root parent element to query off of
		 * @param {string} selector query string to match on
		 *
		 * @returns {Array} elements found matching query
		 */
		queryAll: function(root, selector) {
			return $.makeArray($(root).find(selector));
		},

		/**
		 * Adds event listener to element via jquery
		 * @param {HTMLElement} element Target to attach listener to
		 * @param {string} type Name of the action to listen for
		 * @param {function} listener Function to be executed on action
		 *
		 * @returns {void}
		 */
		on: function(element, type, listener) {
			$(element).on(type, listener);
		},

		/**
		 * Removes event listener to element via jquery
		 * @param {HTMLElement} element Target to remove listener from
		 * @param {string} type Name of the action remove listener from
		 * @param {function} listener Function to be removed from action
		 *
		 * @returns {void}
		 */
		off: function(element, type, listener) {
			$(element).off(type, listener);
		}
    };
}());

Box.DOM = Box.JQueryDOM;
