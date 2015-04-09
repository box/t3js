---
layout: documentation
title: Understanding Behaviors
---

# Understanding Behaviors

As we've been developing more code with T3, it has become apparent that there is a common need to share application logic across modules. We have mostly been doing this by duplicating code or creating services that encapsulate the common functionality. Unfortunately, services are ill-suited for many of the instances we've seen. Behaviors seek to fill the gap of shareable application logic that can be applied in a declarative way.

## Defining Behaviors

Behaviors are defined in a manner similar to modules. The `Box.Application.addBehavior()` method accepts a name for the behavior and a creator function that is used to create the behavior object. Each behavior is represented by a single object and that single object is used for all modules that use the behavior:

```js
Box.Application.addBehavior('behavior-name', function(context) {

    return {

        onclick: function(event, element, elementType) {
            // more code here
        }

    };

});
```

In general, behaviors can do almost everything that modules can do:

* Specify event handlers using the "on[event]" method format.
* Listen for messages using the `messages` array.
* Broadcast messages via `context.broadcast()`.
* Retrieve services via `context.getService()`.

## Using Behaviors

Modules declare that they would like to use a behavior by listing behavior names out in the behaviors array. This declares to the application that the module would like this behavior to apply within the module boundaries. For example:

```js
Box.Application.addModule('test-module', function(context) {

    return {

        behaviors: [ 'behavior-name' ],

        init: function() {
            //code
        }

    };

});
```

The module itself has no access to the behavior object itself or to anything that the behavior is doing. For all intents and purposes, the module knows nothing about the behavior except that it has a name and some functionality will be applied to the module markup.

## Event Handling Order

When an event occurs inside of the module, the module object itself has the first opportunity to respond. After the module, each behavior receives the event in the order in which they are specified in the behaviors array. Consider this example:

```js
Box.Application.addModule('test-module', function(context) {

    return {

        behaviors: [ 'behavior-name1', 'behavior-name2' ],

        onclick: function(event, element, elementType) {
            // more code here
        }

    };

});
```

When a click occurs in this module, the click event will first be handled by `test-module`, then `behavior-name1`, and then `behavior-name2`.

While there's no way to manually prevent individual behaviors from responding to events from within modules, you can use `event.stopImmediatePropagation()` to stop all behaviors from responding to the event.
