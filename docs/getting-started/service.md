---
layout: documentation
title: Services
prev: module
next: ../guides/thinking-in-t3
---

# Creating a Service

When your module needs to do something that isn't directly related to user interaction, you should consider creating a service. A service is any reusable utility and may not necessarily be unique to your application or web page. You can think of a service as a library of functionality that may be used in multiple places.

## JavaScript for Services

Services are defined by calling `Box.Application.addService()`. This method accepts two arguments: the module ID and a creator function. This is similar to `Box.Application.addModule()` but with one important exception: the argument passed to the creator function is `Box.Application`. That's because services are considered to be extensions of `Box.Application` and therefore are able to access all of the available functionality (as opposed to modules, which only may access a subset of the functionality).

The basic format for services is:

```js
Box.Application.addService('serviceID', function(application) {

    // private methods here

    return {

        // public methods here

    };
});
```

There are no predefined patterns for services, so you are free to create an interface that is appropriate for your needs. There's also no lifecycle for services, as they are simply libraries of functionality that must define their own lifecycle (or lack thereof).

### Example

In the credit card validator example, the actual credit card validation functionality is a good candidate to be a service because credit card number validation is a generic algorithm that could be used anywhere. It's comprised of [Luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm) for checksum validation of the credit card number and ensuring the expiration date is in the future. Here's the credit card validation service:

```js
Box.Application.addService('credit-card', function(application) {

    'use strict';

    //--------------------------------------------------------
    // Private
    //--------------------------------------------------------

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

        isValid: function(ccNumber, month, year) {
            return this.isValidNumber(ccNumber) && !this.isExpired(month, year);
        },

        isValidNumber: function(ccNumber) {
            return doLuhnCheck(ccNumber);
        },

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
```

The service exposes three methods: `isValid()`, `isValidNumer()`, and `isExpired()`. There's also one private function called `doLuhnCheck()` that performs the actual checksum validation. Keep in mind that not every consumer of this service will use all of these methods, however, all of the methods are useful on their own and make it easier to write tests for service.

## Accessing a Service

When a module or another service wants to access this service, it can do so using `context.getService()` (in modules) or `application.getService()` (in services) and passing in the service ID. For example:

```js
Box.Application.addModule('moduleID', function(context) {

    // private methods here

    return {

        init: function() {
            var service = context.getService('serviceID');

            // use the service
        }

    };
});
```

All services are lazily-initialized, so the service creator function isn't called until the first time a module requests the service. The call to `getService()` returns the object that was returned from the service's creator function.

### Example

In the credit card validation example, here's how the module uses the service:

```js
Box.Application.addModule('cc-validation-form', function(context) {

    'use strict';

    var creditCardService,
        moduleEl;

    return {

        init: function() {
            creditCardService = context.getService('credit-card');
            moduleEl = context.getElement();
        },

        destroy: function() {
            moduleEl = null;
            creditCardService = null;
        },

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

        setMessage: function(message) {
            var messageEl = moduleEl.querySelector('.message');
            messageEl.innerText = message;
        }
    };

});
```

In this code, the module stores a reference to the credit card service in `creditCardService`. That object is then used to validate the credit card number when the validate button is clicked. Depending on the validity of the credit card, a message is populated on screen.

## Conclusion

For this example, you've seen how to separate functionality between a module and a service. For most features, you'll begin with a module and then determine what functionality belongs in one or more services. In general, it's a good idea to put functionality into services whenever there's a possibility that it may be necessary somewhere else in the application.

The [full example](#) is available online.
