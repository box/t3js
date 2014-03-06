/**
 * @fileoverview Credit Card Form Module
 * @author jtan
 */

/**
 * Manages a form that does credit card validation
 */
Box.Application.addModule('cc-validation-form', function(context) {

	'use strict';

	var creditCardService,
		moduleEl;

	return {
		/**
		 * Initializes the module and caches the module element
		 * @returns {void}
		 */
		init: function() {
			creditCardService = context.getService('credit-card');
			moduleEl = context.getElement();
		},

		/**
		 * Destroys the module and clears references
		 * @returns {void}
		 */
		destroy: function() {
			moduleEl = null;
			creditCardService = null;
		},

		/**
		 * Handles the click event
		 * @param {Event} event The event object
		 * @param {HTMLElement} element The nearest element that contains a data-type attribute
		 * @param {string} elementType The data-type attribute of the element
		 * @returns {void}
		 */
		onclick: function(event, element, elementType) {

			if (elementType === 'validate-btn') {

				var number = moduleEl.querySelector('[name="cc-number"]').value,
					month = parseInt(moduleEl.querySelector('[name="cc-exp-month"]').value, 10),
					year = parseInt(moduleEl.querySelector('[name="cc-exp-year"]').value, 10);

				if (creditCardService.isValid(number, month, year)) {
					this.setMessage("Card is valid!");
				} else {
					this.setMessage("Card is invalid!");
				}
				event.preventDefault();
			}

		},

		/**
		 * Sets the display message
		 * @param {string} message The message to display
		 * @returns {void}
		 */
		setMessage: function(message) {
			var messageEl = moduleEl.querySelector('.message');
			messageEl.innerText = message;
		}
	};

});
