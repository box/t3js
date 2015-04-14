---
layout: documentation
title: Modules
prev: thinking-in-t3
next: services
---

# Understanding Modules

Modules represent an area on a web page, and as such, contain what is considered application logic. Application logic is functionality that the user interacts with in some way (usually by clicking). Modules are intentionally limited in what they are able to do to ensure they remain simple and clean. Additionally, modules have a lifecycle associated with them, so they can be started and stopped at any point in time. Modules never start themselves and do not execute any code until they are started. The majority of application code is written as modules.

## HTML for Modules

Every module needs an element on the page that represents it. To indicate than an element represents a module, give it a `data-module` attribute specifying the module name. For example:

```html
<div data-module="module-name">
    <!-- your module HTML here -->
</div>
```

Note that an ID for the element is not necessary. Using the `data-module` attribute, the framework will automatically find the element and bind the correct module JavaScript to it.
If you'd like to respond to an element or group of elements when an event occurs (such as click), then annotate that element with `data-type` and a value indicating the nature of the element (not what the element should do). You can then check this value to determine the correct course of action. For example:

```html
<div data-module="module-name">
    <button data-type="like-btn">Like</button>
</div>
```

The value for `data-type` should describe what the element is, not what it does. In this example, the `"like-btn"` value indicates what the button is so the JavaScript can determine how to respond when the element is interacted with. Prefer `data-type` attributes to IDs and classes, which may have other meanings.

Note: there are no restrictions as to which HTML elements may represent a T3 module. While many examples on this site use `<div>` elements, that's not a requirement.

## JavaScript for Modules

All modules start out with the same basic format:

```js
/**
 * @fileoverview Description of file
 * @author your name
 */

/*global Box*/

/*
 * Description of module.
 */
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    /**
     * Description of function.
     * @param {type} name Description
     * @returns {type} Description
     * @private
     */
    function privateFunction(name) {

    }

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {

        /**
         * Description of method.
         * @param {type} name Description
         * @returns {type} Description
         */
        method: function(name) {

        }
    };

});
```

We recommend that the name of the module is passed into `Box.Application.addModule()` should match the name of the file without the `.js` extension (for instance, `"header"` for the file `header.js`). The second argument is a creator function that is called when the module is started. The creator function receives `context` as an argument, which is an instance of `Box.Context`. This is the module's touchpoint into the outside world. Everything the module wants to do that is outside of itself needs to be done, in some way, through the context object.

### Public vs. Private

When designing your module, it's important to think about which methods should be public (on the returned object) and which should be private. In general, think about the various things that a module does. The module may show a menu when a link is clicked, or make a request to the server, these should be represented as methods on the returned object so that they can be tested separately. You will always have methods such as `init()`, `onclick()`, etc., on your returned object, but those shouldn't be the only ones in most cases.

A good rule of thumb is that you should be able to make your module work without using `onclick()`, which means that you need to have methods for everything the module does as a result of a user event. Methods like `showMenu()` or `toggleDescription()` are appropriate to be returned as part of the public interface.

Private variables and methods are for utility functions and extra data that the public methods need to complete their job.

### Designing Your API

T3 modules are designed specifically to enable you to create small units of functionality that are easily unit-testable and maintainable. As such, it's important to follow a more formal design process for these modules. When designing your module's public interface, first list out the module's interactions. For example, if you were designing the header module, you may list out the following interactions:

* When the user clicks on the info button, a dialog is displayed.
* When the user clicks on their name, a menu is displayed.
* When the user types into the searchbox and hits the search button, a search is performed.
* When the user clicks on the upgrade button, a menu is displayed.

This list of functionality represents the "public" interface to the module, which is to say that these are the behaviors you want to test outside of any specific user interaction. So your first take at a module interface is:

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // private stuff here

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {
        showUserMenu: function(){},
        showInfoDialog: function(){},
        showUpgradeMenu: function(){},
        performSearch: function(query){}
    };

});
```

Once you have this basic interface defined, you can go on to wire things up with events, add `init()` and `destroy()`, and flesh out the actual implementation. The important part is that each discrete interaction is represented as a method you can call and test separately.

### Module Lifecycle

When `Box.Application.addModule()` is called, the module declaration is registered with the framework. The module doesn't actually start at that point in time. In fact, from the module's point of view, there is no guarantee as to when the module will be started (or if it ever will). The application itself decides when any given module is started, which may be on page load or at a later time if the module is being dynamically loaded. Module lifecycles are purposely decoupled from the page lifecycle to allow for more flexibility.

When it's time for the module to start, the framework looks for a method called `init()` to execute (this method is optional). If your module needs to do anything when it's started, then `init()` is the method to do so within.

Similarly, a module doesn't know when it will be shut down and it may be shut down at any time. When a module is to be shut down, the framework looks for a method called `destroy()` to execute (also optional). Anything that is setup in the `init()` method should be cleaned up in the `destroy()` method.

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here

    //-----------------------------------------------------------
    // Public API
    //-----------------------------------------------------------


    return {

        init: function() {
            // initialize the module here
        },

        destroy: function() {
            // clean up the module here
        }
    };
});
```

### Retrieving the Module Element

Since each module is represented by a DOM element, it's often useful to retrieve a reference to that element as the basis for DOM queries. You can retrieve a reference to the module element by using `context.getElement()`. For example:

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    var element;

    //-----------------------------------------------------------
    // Public API
    //-----------------------------------------------------------

    return {

        init: function() {
            element = context.getElement();
        },

        destroy: function() {
            element = null;
        }
    };
});
```

Here, the module element is retrieved during `init()` and stored in a private variable `element`. That variable can then be used in other methods before it is dereferenced in `destroy()`.

### Handling Events

Modules handle all events inside of their container element. In order to subscribe to a particular type of event, add a method on the module object in the same format you would on a DOM element (i.e., "onclick"). When the module object is created, its methods are inspected to determine which DOM events the module wants to receive. The event handler is automatically attached based to the element that represents the module. Using event delegation, the method on the module is called for all events of that type within the module element.

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {

        onclick: function(event, element, elementType) {

            if (elementType === 'action-1') {
                this.doSomething();
            } else if (elementType === 'action-2') {
                this.doSomethingElse();
            }
        },

        doSomething: function() {},
        doSomethingElse: function() {}
    };
});
```

The `onclick()` method is automatically called when a click happens inside of the module's element. The event object is a DOM-normalized object so that it is the same in all browsers, including Internet Explorer 8. The second argument is the nearest ancestor element with a `data-type` attribute specified and the third argument is the value of `data-type` on that element. When an event occurs, checks to see if it has a `data-type` attribute, and if not, it checks its parent, and continues until it either finds an element with a `data-type` attribute or it reaches the module element.

You can pull any additional information off of the `event` object as necessary to take the correct course of action. In the previous example, the code is using `elementType` to determine what to do next. This is the most common use case.

Note that not all events are supported. Specifically, we support most events that bubble and do not support any events that don't bubble. The most notable events that don't bubble and are therefore not support are `focus` and `blur`.

Some best practices for event handlers:

* Don't pass the `event` object into another method. Take whatever information you need off of the `event` object and pass it into the next method.
* Don't include application logic in the event handler. Everything the module is capable of doing should be represented as a method on the object and the event handler should call out to those methods.

## Cross-Module Messaging

Since modules are completely isolated from one another, you cannot directly access one module from another. Modules communicate with one another through messages. A message is composed of a name and optionally some additional data. Messages are sent throughout the entire system by using the `broadcast()` method on the context object, such as:

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {

        onclick: function(event, element, elementType) {

            context.broadcast('moduleclicked', 'Extra data');
        }
    };
});
```

When `broadcast()` is called, the messages is immediately sent to all modules that are interested in that message. Modules indicates this interest by specifying a modules array on the public interface containing the names of all messages they are interested in. When the message occurs, the `onmessage()` method is called and the name and data are passed in as arguments:

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {
        messages: [ 'moduleclicked' ],

        onmessage: function(name, data) {

            if (name === 'moduleclicked') {
                process(name, data);
            }
        }
    };
});
```

In this example, the module is listening for the "moduleclicked" message. The wireup to `onmessage()` happens automatically and without any further code.

Note: Messages are not commands as to what should happen. For example, "makerequest" is not an appropriate message name. Messages are intended to share information about what has happened, not what will happen. That allows others modules to react appropriately.

All modules can listen for messages - you cannot specifically target a module to receive any given message. That's because you can't rely on any other modules actually existing on the page.

## Configuration Data

Configuration data is information that the module needs to function properly but isn't necessarily related to an element on the page. You can place configuration data inside of your module's markup by using a `<script>` tag and embedded a JSON object inside. For example:

```html
<div data-module="module-name">
    <script type="text/x-config">{"itemsPerPage":10,"root":"/home"}</script>

    <!-- your module HTML here -->
</div>
```

Note the `<script>` element must have a `type` of `"text/x-config"` to be registered as the module's configuration data. The contents must also be valid JSON, and as such, we strongly recommend using a server-side helper for generating its contents

With that complete, you can access the configuration data in JavaScript using the context.getConfig() method:

```js
Box.Application.addModule('module-name', function(context) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {

        init: function() {

            var config = context.getConfig(),
                url = config.root,
                itemsPerPage = config.itemsPerPage;
        }
    };
});
```

In this example, the `init()` method reads the configuration data for that module. The data is retrieved automatically by looking in the module element to find the first `<script>` element with a `type` of `"text/x-config"`.
