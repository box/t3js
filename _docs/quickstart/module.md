---
layout: documentation
title: Modules
next_section: module
permalink: /docs/quickstart/application
---

One you have `Box.Application` on the page, you can start adding modules. A T3 module represents a specific area of a web page and is in charge of responding to events that occur in that area. You can think of a module as a mini application in that it has its own lifecycle and has responsibilities that it must perform in order for its area of the page to be functional. For this reason, modules are said to contain *application logic*, which is to say that they interact with the user and vice-versa.

Modules are intentionally limited in what they are able to do to ensure they remain simple and clean. Additionally, modules have a lifecycle associated with them, so they can be started and stopped at any point in time. Modules never start themselves and do not execute any code until they are started. The majority of an application's code is written as modules.

## HTML for Modules

Modules are wired to DOM elements by using the `data-module` attribute and specifying the ID of the module to use. For example:

```html
<div data-module="my-module">
    <!-- content -->
</div>
```

This HTML specifies that the module `my-module` is responsible for the contents of this `<div>` element. When `Box.Application.init()` is called, it searches the DOM for all elements with `data-module` attributes and automatically wires up the module JavaScript to handle the appropriate elements.

Within a module's HTML, there might be elements that you are particular interested in when they are clicked or otherwise interacted with. You can mark such elements using the `data-type` attribute and specifying a value. You can think of `data-type` as similar to the `class` attribute in that it's meant to denote categories of elements rather than unique identifiers. For example:

```html
<div data-module="my-module">
    <button data-type="submit-btn">Submit</button>
</div>
```

When events occur within a module, the value of the closest ancestor `data-type` is passed along so you can more easily identify the element. This allows you to watch for events within a large area in the same way you can for a single element.

### Example

Suppose you're creating a credit card validation form that takes the credit card number and expiration date for a credit card. Here's the HTML for such a module:

```html
<div class="credit-card-container" data-module="cc-validation-form">
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
```

In this example, the T3 module `cc-validation-form` is wired up to this HTML. The button has a `data-type` of `validate-btn`, so it's clear the module is specifically interested on events for that element.

## JavaScript for Modules

Modules are defined by calling `Box.Application.addModule()`. This method accepts two arguments: the module ID and a creator function. The creator function receives a `context` object that is the module's touchpoint to things that are outside of the module. The basic format for modules is:

```js
Box.Application.addModule('moduleID', function(context) {

    // private methods here

    return {

        // public methods here

    };
});
```

The second argument to `Box.Application.addModule()`, what we call the creator function, is an implementation of the [module pattern](http://yuiblog.com/blog/2007/06/12/module-pattern/). The only difference is that the returned object is not exported publicly. Instead, the returned object is stored inside of `Box.Application`. (Modules are purposely not able to access other module objects in order to enforce loose coupling.)

### Handling Events

Handling events, such as clicks and key presses, are central to any web application. T3 modules make it easy to handle events by wiring up event handlers for you automatically. Suppose you want to listen for the `click` event for something in your module. You can simply add the `onclick` method to your module object, such as:

```js
Box.Application.addModule('moduleID', function(context) {

    // private methods here

    return {

        onclick: function(event, element, elementType) {

            // event is a DOM2-compliant event object
            // element is the closest ancestor that has a data-type attribute
            // elementType is the value of element's data-type attribute
        }

    };
});
```

Event handler methods, such as `onclick` in this example, receive three arguments:

1. `event` - a DOM2-compliant event object
1. `element` - the closest ancestor element that has a `data-type` attribute
1. `elementType` - the value of `data-type` for the `element`

If you simply omit using the second and third arguments, then `onclick` behaves like any other event handler that you're used to. The additional arguments are there as a convenience to help better locate where specific events have occurred in the DOM.

The same approach can be used for adding event handlers for any event that bubbles. Just add an `on*` method to your module and the proper event binding happens automatically for you.

**Note:** Module event handlers listen to events for the *entire* module, so be sure to verify which element caused the event before responding.

### Example

Going back to the previous example of a credit card validator, the T3 module start out looking like this:


```js
Box.Application.addModule('cc-validation-form', function(context) {

    'use strict';

    return {

        onclick: function(event, element, elementType) {

            // retrieve the element representing the module
            var moduleEl = context.getElement();

            if (elementType === 'validate-btn') {

                var number = moduleEl.querySelector('[name="cc-number"]').value,
                    month = parseInt(moduleEl.querySelector('[name="cc-exp-month"]').value, 10),
                    year = parseInt(moduleEl.querySelector('[name="cc-exp-year"]').value, 10);

                // do something to validate this information

                event.preventDefault();
            }

        }

    };

});
```

In this code, the `onclick` handler is used to listen for clicks on the button. The first step is to get a reference to the module's element, which is done via `context.getElement()`. Next, the `elementType` is checked to see if the validate button was the one that triggered the event. If so, then the various values are pulled from the form. After that point, you would include your validation logic (covered later in this guide).

**Note:** It's considered a best practice to always start from the module's element when searching for elements inside the module (as opposed to starting from `document`).

### Module Lifecycle

Another important concept to understand is that modules have their own lifecycles. Modules can be started or stopped at any point in time. There are two methods related to the lifecycle `init()` and `destroy()`. When a module is started, its `init()` method is called if present;  when the module is stopped, its `destroy()` method is called if present. Neither method is required, but they are recommended for most modules to ensure proper initialization and cleanup.

In the case of the credit card form validator, consider that `moduleEl` may need to be used in more than one method. It might make sense to make `moduleEl` a variable in the creator function so it's available to all module methods, such as:

```js
Box.Application.addModule('cc-validation-form', function(context) {

    'use strict';

    // declare the variable here so all methods can access it
    var moduleEl;

    return {

        init: function() {
            // capture the reference when the module is started
            moduleEl = context.getElement();
        },

        onclick: function(event, element, elementType) {

            if (elementType === 'validate-btn') {

                var number = moduleEl.querySelector('[name="cc-number"]').value,
                    month = parseInt(moduleEl.querySelector('[name="cc-exp-month"]').value, 10),
                    year = parseInt(moduleEl.querySelector('[name="cc-exp-year"]').value, 10);

                // do something to validate this information

                event.preventDefault();
            }

        },

        destroy: function() {
            moduleEl = null;    // clear the reference
        }

    };

});
```

In this example, the `init()` and `destroy()` methods are used to manage the `moduleEl` reference. It's a good practice not to get DOM references until `init()`, since the state of the DOM may change before your module is started. We also recommend clearing those references when the module is stopped to free up memory.
