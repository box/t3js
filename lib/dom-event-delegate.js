/**
 * @fileoverview An object that encapsulates event delegation wireup for a
 * DOM element.
 * @author Box
 */

Box.DOMEventDelegate = (function() {

	'use strict';

	// Supported events for modules. Only events that bubble properly can be used in T3.
	var DEFAULT_EVENT_TYPES = ['click', 'mouseover', 'mouseout', 'mousedown', 'mouseup',
			'mouseenter', 'mouseleave', 'mousemove', 'keydown', 'keyup', 'submit', 'change',
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
		var found = false;
		var moduleBoundaryReached = false;

		// We need to check for the existence of 'element' since occasionally we call this on a detached element node.
		// For example:
		//  1. event handlers like mouseout may sometimes detach nodes from the DOM
		//  2. event handlers like mouseleave will still fire on the detached node
		// Checking existence of element.parentNode ensures the element is a valid HTML Element
		while (!found && element && element.parentNode && !moduleBoundaryReached) {
			found = isTypeElement(element);
			moduleBoundaryReached = isModuleElement(element);

			if (!found) {
				element = element.parentNode;
			}

		}

		return found ? element : null;
	}

	/**
	 * Iterates over each supported event type that is also in the handler, applying
	 * a callback function. This is used to more easily attach/detach all events.
	 * @param {string[]} eventTypes A list of event types to iterate over
	 * @param {Object} handler An object with onclick, onmouseover, etc. methods.
	 * @param {Function} callback The function to call on each event type.
	 * @param {Object} [thisValue] The value of "this" inside the callback.
	 * @returns {void}
	 * @private
	 */
	function forEachEventType(eventTypes, handler, callback, thisValue) {

		var i,
			type;

		for (i = 0; i < eventTypes.length; i++) {
			type = eventTypes[i];

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
	 * @param {string[]} [eventTypes] A list of event types to handle (events must bubble). Defaults to a common set of events.
	 * @constructor
	 */
	function DOMEventDelegate(element, handler, eventTypes) {

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
		 * List of event types to handle (make sure these events bubble!)
		 * @type {string[]}
		 * @private
		 */
		this._eventTypes = eventTypes || DEFAULT_EVENT_TYPES;

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

				forEachEventType(this._eventTypes, this._handler, function(eventType) {
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
			forEachEventType(this._eventTypes, this._handler, function(eventType) {
				Box.DOM.off(this.element, eventType, this._boundHandler[eventType]);
			}, this);
		}
	};

	return DOMEventDelegate;
}());

