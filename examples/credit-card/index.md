---
layout: examples
title: T3 JavaScript Framework - Credit Card
permalink: /examples/credit-card/
---

# Credit Card Validator

This is an example of how to build a simple module and service to handle credit card validation.

<link rel="stylesheet" href="{{ site.baseurl }}/examples/credit-card/css/credit-card.css" />

<div class="module credit-card-container" data-module="cc-validation-form">
	<form>
		<label>
			CC Number:
			<input type="text" name="cc-number" maxlength="20" value="378282246310005">
		</label>
		<label>
			Month (##):
			<input type="text" name="cc-exp-month" maxlength="2" value="12">
		</label>
		<label>
		Year (####):
			<input type="text" name="cc-exp-year" maxlength="4" value="2020">
		</label>
		<input type="button" data-type="validate-btn" value="Validate Card">
	</form>
	<span class="message"></span>
</div>

Sample Credit Cards:

 * AMEX - 378282246310005
 * VISA - 4111111111111111

# HTML
{% highlight html %}
<div class="module credit-card-container" data-module="cc-validation-form">
	<form>
		<label>
			CC Number:
			<input type="text" name="cc-number" maxlength="20">
		</label>
		<label>
			Month (##):
			<input type="text" name="cc-exp-month" maxlength="2">
		</label>
		<label>
			Year (####):
			<input type="text" name="cc-exp-year" maxlength="4">
		</label>
		<input type="button" data-type="validate-btn" value="Validate Card">
	</form>
	<span class="message"></span>
</div>
{% endhighlight %}

JS
==
Please note that this example does not cover input validation. Input validation can be implemented
via native HTML5 form validation or a separate T3 service.

<div class="anchor" id="module"></div>
## Module

{% highlight js %}
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
		 * @param {HTMLElement} element The nearest element with a data-type
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

{% endhighlight %}

<div class="anchor" id="service"></div>
## Service

{% highlight js %}
/**
 * Verifies credit card numbers and expiration dates
 */
Box.Application.addService('credit-card', function(application) {

	'use strict';

	//--------------------------------------------------------
	// Private
	//--------------------------------------------------------

	/**
	 * Returns true if Luhn's algorithm passes
	 * @param {string} ccNumber A credit card number string
	 * @returns {boolean}
	 * @private
	 */
	function doLuhnCheck(ccNumber) {
		if (/[^0-9-\s]+/.test(ccNumber)) {
			return false;
		}

		var checksum = 0,
			digit = 0,
			isEven = false;

		ccNumber = ccNumber.replace(/\D/g, "");

		for (var n = ccNumber.length - 1; n >= 0; n--) {
			digit = parseInt(ccNumber.charAt(n), 10);

			if (isEven) {
				if ((digit *= 2) > 9) {
					digit -= 9;
				}
			}

			checksum += digit;
			isEven = !isEven;
		}

		return (checksum % 10) == 0;
	}

	//---------------------------------------------------------
	// Public
	//---------------------------------------------------------

	return {

		/**
		 * Returns true if card is valid given a number and expiration month/year
		 * @param {string} ccNumber A credit card number string
		 * @param {number} month Card's month of expiration
		 * @param {number} year Card's year of expiration
		 * @returns {boolean}
		 */
		isValid: function(ccNumber, month, year) {
			return this.isValidNumber(ccNumber) && !this.isExpired(month, year);
		},

		/**
		 * Returns true if credit card number is valid (luhn check passed)
		 * @param {string} ccNumber A credit card number string
		 * @returns {boolean}
		 */
		isValidNumber: function(ccNumber) {
			return doLuhnCheck(ccNumber);
		},

		/**
		 * Returns true if card is expired (< card month/year)
		 * @param {number} month Card's month of expiration
		 * @param {number} year Card's year of expiration
		 * @returns {boolean}
		 */
		isExpired: function(month, year) {
			var currentDate = new Date(),
				currentYear = currentDate.getFullYear();

			if (currentYear > year) {
				return true;
			} else if (currentYear === year
					&& (month - 1) < currentDate.getMonth()) {
				// Months are zero-indexed, Jan = 0, Feb = 1...
				return true;
			} else {
				return false;
			}
		}

	};

});

{% endhighlight %}

<div class="anchor" id="init"></div>
## init

{% highlight js %}

// Fire up the application
Box.Application.init();

{% endhighlight %}



<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="{{ site.baseurl }}/js/t3-0.1.1.js"></script>
<script type="text/javascript" src="{{ site.baseurl }}/examples/credit-card/js/modules/cc-validation-form.js"></script>
<script type="text/javascript" src="{{ site.baseurl }}/examples/credit-card/js/services/credit-card.js"></script>
<script>
Box.Application.init();
</script>