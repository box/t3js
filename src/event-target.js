/**
 * @fileoverview Definition of a custom event type. This is used as a utility
 * throughout the framework whenever custom events are used. It is intended to
 * be inherited from, either through the prototype or via mixin.
 * @author nzakas
 */

/*global Box*/

(function() {

	'use strict';

	/**
	 * An object that is capable of generating custom events and also
	 * executing handlers for events when they occur.
	 * @constructor
	 */
	Box.EventTarget = function() {

		/**
		 * Map of events to handlers. The keys in the object are the event names.
		 * The values in the object are arrays of event handler functions.
		 * @type {Object}
		 * @private
		 */
		this._handlers = {};
	};

	Box.EventTarget.prototype = {

		// restore constructor
		constructor: Box.EventTarget,

		/**
		 * Adds a new event handler for a particular type of event.
		 * @param type {string} The name of the event to listen for.
		 * @param handler {Function} The function to call when the event occurs.
		 * @returns {void}
		 */
		on: function(type, handler) {
			if (typeof this._handlers[type] == "undefined") {
				this._handlers[type] = [];
			}

			this._handlers[type].push(handler);
		},

		/**
		 * Fires an event with the given name and data.
		 * @param type {string} The type of event to fire.
		 * @param [data] {Object} An object with properties that should end up on
		 * 		the event object for the given event.
		 * @returns {void}
		 */
		fire: function(type, data) {

			var handlers,
				i,
				len,
				property,
				event = {
					type: type,
					data: data
				};

			// if there are handlers for the event, call them in order
			handlers = this._handlers[event.type];
			if (handlers instanceof Array) {
				for (i = 0, len = handlers.length; i < len; i++) {
					handlers[i].call(this, event);
				}
			}
		},

		/**
		 * Removes an event handler from a given event.
		 * @param type {string} The name of the event to remove from.
		 * @param handler {Function} The function to remove as a handler.
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

}());