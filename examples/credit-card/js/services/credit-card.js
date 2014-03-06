/**
 * @fileoverview Credit Card Validation Service
 * @author jtan
 */

/**
 * Verifies credit card numbers and expiration dates
 */
Box.Application.addService('credit-card', function(application) {

	'use strict';

	//--------------------------------------------------------------------------
	// Private
	//--------------------------------------------------------------------------

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

	//--------------------------------------------------------------------------
	// Public
	//--------------------------------------------------------------------------

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
			} else if (currentYear === year && (month - 1) < currentDate.getMonth()) {
				// Months are zero-indexed, Jan = 0, Feb = 1...
				return true;
			} else {
				return false;
			}
		}

	};

});
