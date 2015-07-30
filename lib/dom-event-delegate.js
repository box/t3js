/**
 * @fileoverview An object that encapsulates event delegation wireup for a
 * DOM element.
 * @author Box
 */

Box.DOMEventDelegate = (function() {

	'use strict';

	// Supported events for modules. Only events that bubble properly can be used in T3.
	var EVENT_TYPES = ['click', 'mouseover', 'mouseout', 'mousedown', 'mouseup',
			'mouseenter', 'mouseleave', 'keydown', 'keyup', 'submit', 'change',
			'contextmenu', 'dblclick', 'input', 'focusin', 'focusout'];


	/**
	 * Determines if a given element represents a module.
	 * @param {HTMLElement} element The element to check.
	 * @returns {boolean} True if the element represents a module, false if not.
	 * @private
	 */
	function isModuleElement(element) {
		return element && element.hasAttribute('data-module');
	}

	/**
	 * Determines if a given element represents a T3 type.
	 * @param {HTMLElement} element The element to check.
	 * @returns {boolean} True if the element represents a T3 type, false if not.
	 * @private
	 */
	function isTypeElement(element) {
		return element && element.hasAttribute('data-type');
	}

	/**
	 * Finds the closest ancestor that of an element that has a data-type
	 * attribute.
	 * @param {HTMLElement} element The element to start searching from.
	 * @returns {HTMLElement} The matching element or null if not found.
	 */
	function getNearestTypeElement(element) {
		var found = isTypeElement(element);

		// We need to check for the existence of 'element' since occasionally we call this on a detached element node.
		// For example:
		//  1. event handlers like mouseout may sometimes detach nodes from the DOM
		//  2. event handlers like mouseleave will still fire on the detached node
		// Without checking the existence of a parentNode and returning null, we would throw errors
		while (!found && element && !isModuleElement(element)) {
			element = element.parentNode;
			found = isTypeElement(element);
		}

		return found ? element : null;
	}

	/**
	 * Iterates over each supported event type that is also in the handler, applying
	 * a callback function. This is used to more easily attach/detach all events.
	 * @param {Object} handler An object with onclick, onmouseover, etc. methods.
	 * @param {Function} callback The function to call on each event type.
	 * @param {Object} [thisValue] The value of "this" inside the callback.
	 * @returns {void}
	 * @private
	 */
	function forEachEventType(handler, callback, thisValue) {

		var i,
			type;

		for (i = 0; i < EVENT_TYPES.length; i++) {
			type = EVENT_TYPES[i];

			// only call the callback if the event is on the handler
			if (handler['on' + type]) {
				callback.call(thisValue, type);
			}
		}
	}

	/**
	 * An object that manages events within a single DOM element.
	 * @param {HTMLElement} element The DOM element to handle events for.
	 * @param {Object} handler An object containing event handlers such as "onclick".
	 * @constructor
	 */
	function DOMEventDelegate(element, handler) {

		/**
		 * The DOM element that this object is handling events for.
		 * @type {HTMLElement}
		 */
		this.element = element;

		/**
		 * Object on which event handlers are available.
		 * @type {Object}
		 * @private
		 */
		this._handler = handler;

		/**
		 * Tracks event handlers whose this-value is bound to the correct
		 * object.
		 * @type {Object}
		 * @private
		 */
		this._boundHandler = {};

		/**
		 * Indicates if events have been attached.
		 * @type {boolean}
		 * @private
		 */
		this._attached = false;
	}


	DOMEventDelegate.prototype = {

		// restore constructor
		constructor: DOMEventDelegate,

		_handleEvent: function(event) {
			var targetElement = getNearestTypeElement(event.target),
				elementType = targetElement ? targetElement.getAttribute('data-type') : '';

			this._handler['on' + event.type](event, targetElement, elementType);
		},

		/**
		 * Attaches all event handlers for the DOM element.
		 * @returns {void}
		 */
		attachEvents: function() {
			if (!this._attached) {

				forEachEventType(this._handler, function(eventType) {
					var that = this;

					function handleEvent() {
						that._handleEvent.apply(that, arguments);
					}

					Box.DOM.on(this.element, eventType, handleEvent);

					this._boundHandler[eventType] = handleEvent;
				}, this);

				this._attached = true;
			}
		},

		/**
		 * Detaches all event handlers for the DOM element.
		 * @returns {void}
		 */
		detachEvents: function() {
			forEachEventType(this._handler, function(eventType) {
				Box.DOM.off(this.element, eventType, this._boundHandler[eventType]);
			}, this);
		}
	};

	return DOMEventDelegate;
}());

