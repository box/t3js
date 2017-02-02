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
	
	function isArray(argument) {
		return Object.prototype.toString.call(argument) === '[object Array]';
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
			if (!isArray(handlers)) {
				return;
			}

			// @NOTE: do a concat() here to create a copy of the handlers array,
			// so that if another handler is removed of the same type, it doesn't
			// interfere with the handlers array during this loop
			handlers = handlers.concat();
			for (i = 0, len = handlers.length; i < len; i++) {
				handlers[i].call(this, event);
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
				len,
				remainingHandlers = [];

			if (!isArray(handlers)) {
				return;
			}

			for (i = 0, len = handlers.length; i < len; i++) {
				if (handlers[i] !== handler) {
					remainingHandlers.push(handler);
				}
			}
			
			this._handlers[type] = remainingHandlers;
			
			if (this._handlers[type].length === 0) {
		        	delete this._handlers[type];
		        }
		}
	};

	return EventTarget;

}());
