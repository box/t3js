---
layout: documentation
title: Services
prev: modules
next: behaviors
---

# Understanding Services

Services are an important part of the T3 JavaScript architecture that provide additional capabilities to modules or other parts of the system. If you are providing a new capability to the system, then it's likely a candidate to be a service. Services can be UI-based or not, so menus and tabs as well as cookie management and tracking are all considered services. In general, anything that a module needs to do its job is a service, as modules contain application logic (code that reacts to the user). Modules start automatically whereas services do not; services must be used by a module (or another component) in order for the service to be created. Otherwise, services stay inert, waiting for someone to use them.

**Important:** Services are supposed to be reusable by multiple modules. Keep that in mind when designing your interface. If it's too specific to a single use case, then it's worth exploring whether it can be made more generic so that others can use it.

```js
/**
 * @fileoverview Description of file
 * @author your name
 */

/*global Box*/

/**
 * Description of service.
 */
Box.Application.addService('service-name', function(application) {

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

The name of the service passed into `Box.Application.addService()` should match the name of the file without the `.js` extension. The second argument is a creator function that is called when the service is requested for the first time. Once the service has been created, it is cached by Box.Application so that every reference to the service uses the same object. The creator function receives `application` as an argument, which is a reference to `Box.Application` that is suitable for the service to use.

## Public vs. Private

Creating a service involves designing the public interface for the service appropriately. The interface is important to put some thought into because it is a contract between the service and any other part of the system that uses the service. In general, anything that a consumer of the service (i.e., a module or another service) may need to call should be returned on the service object. Anything that is part of how the service does its job should be private and not returned on the object.

Testing then becomes a matter of testing the public interface. Everything that is possible for a given service should be possible using just the public methods, and therefore, you should be able to properly exercise the service by testing just its public methods.

### Factory Pattern Format

If your service needs to create separate objects for each caller, then you should create a factory object. A factory object has a `create()` method that returns an instance that is unique per call. The basic format for a factory service is as follows:

```js
/**
 * @fileoverview Description of file
 * @author your name
 */

/*global Box*/

/**
 * Description of service.
 */
Box.Application.addService('service-name', function(application) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    /**
     * Description of constructor.
     * @param {type} options Description
     * @constructor
     */
    function YourConstructorName(options) {

    }

    //-----------------------------------------------------------
    // Public
    //-----------------------------------------------------------

    return {

        /**
         * Description of method.
         * @param {type} options Description
         * @returns {service-name~YourConstructorName} Description
         */
        create: function(options) {
           return new YourConstructorName(options);
        }
    };

});
```

The `create()` method can have whatever arguments are appropriate.

You can have additional methods on the returned object if necessary, but the create() method must be always be included.

## How to Use a Service

How you access a service depends on the code that wants to use it.

### From Another Service

To access a service from another service, access the service from the `application` object that is passed into the service creator, such as:

```js
Box.Application.addService('service-name', function(application) {

    'use strict';

    //-----------------------------------------------------------
    // Private
    //-----------------------------------------------------------

    // Private variables and functions go here


    //-----------------------------------------------------------
    // Public API
    //-----------------------------------------------------------


    return {

        doSomething: function() {
            var anotherService = application.getService('another-service');
        }

    };
});
```

### From a Module

To access a service from a module, access the service from the `context` object that is passed into the service creator, such as:

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
            var anotherService = context.getService('another-service');
        }

    };
});
```

## Optional Services

Occasionally, you may want to include a service but only if it is available. Use the `hasService()` method to check if your service has been included on the page.

```js
var someService;
if (application.hasService('some-service')) {
	someService = application.getService('some-service');
}
```

## Do's and Don'ts

* Do think about your public interface. You are creating a utility that is designed to be used by someone else, make sure the interface makes sense.
* Do create services with a single responsibility.
* Do create services that can be used by more than one module.
* Don't reference `Box.Application` directly in your creator function; do use the `application` object that is passed in.
* Don't create global objects inside of the creator function; do reference other services through the `application` object when you need them.

## Why Are Services Important?

* Services encapsulate non-application logic into reusable objects.
* Because we can't anticipate what sort of capabilities modules will need, services act as an extension for new functionality.
* Services may act as an abstraction layer that allows us to swap out low-level utilities without requiring changes to modules.

