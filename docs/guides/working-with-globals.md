---
layout: documentation
title: Working with Globals
---

# Working with Globals

In most web applications, you're going to be mixing and matching various JavaScript libraries. As such, you can expect to be dealing with some form of global objects in addition to T3 components. This could take the form of third-party libraries that you want to use inside of T3 components, or even non-T3 components that need to access T3 components.

At Box, we've had to deal with both of these situations, and so we made T3 in such a way that it's easy to work with global objects.

## Accessing Global Objects from T3

One of the best practices represented in T3 is to favor explict over implicit, and as such, we wanted a way to make dependencies on global objects explicit. While early on we tried wrapping third-party libraries in services, we later decided that some objects should just be used as-is. Today, you can use the `getGlobal()` method to retrieve a reference to a global variable instead of reaching into the global scope and pulling out an object reference.

In modules and behaviors, the `getGlobal()` method is available on the context object. You need only pass in the name of a variable in the global scope to retrieve a reference:

```js
Box.Application.addModule('moduleID', function(context) {

    var $;

    return {

        init: function() {

            // retrieve a reference to jQuery
            $ = context.getGlobal('jQuery');
        }

    };

});
```

Here, the module retrieves a reference to the global `jQuery` object and stores it in a local variable.

Services can also use `getGlobal()`, as it is provided on the application object that is passed into the creator function:

```js
Box.Application.addService('serviceID', function(application) {

    // retrieve a reference to jQuery
    var $ = application.getGlobal('jQuery');

    return {
        // ...
    };

});
```

Using `getGlobal()` instead of reaching out into the global scope directly has several advantages:

1. It is obvious from reading the source code that the given object is a global.
1. It is easy to stub out a value for this global object in tests.
1. Static analysis of the source code can more easily identify global dependencies.

## Accessing T3 from non-T3 Object

You may also find that you need to access T3 from non-T3 objects, global or otherwise. Keep in mind that T3 restricts access to modules and behaviors as part of enforcing strict loose couping. Put simply: modules and behaviors are not meant to be used by outside objects. Services, on the other hand, were made to be accessed by any type of object. As such, you can retrieve services in the global scope by using `Box.Application.getService()`, for example:

```js
// accessing a service from non-T3 code
$(function() {

    var service = Box.Application.getService('myservice');
    service.doSomething();

});
```

This code retrieves the `myservice` service from a jQuery callback. Since the `Box.Application` object is both global and exposes `getService()`, you have an easy way to access any T3 service from any other code.

**Important:** While you can call `Box.Application.getService()` from anywhere, you should be careful to call it after `Box.Application.init()`, as some services may rely on the initialized state of the application to function properly. Retrieving a service before the application is started can cause unexpected errors.
