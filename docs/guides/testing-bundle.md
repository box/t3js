---
layout: documentation
title: T3 Testing Bundle
prev: working-with-globals
next: testing-modules-behaviors
---

# T3 Testing Bundle

The component-based approach of T3 makes it easy to write better tests for your application. Since each component is registered separately and uses dependency injection to access other objects, you can easily stub or mock out dependencies.

The T3 testing bundle is a small utility you include before your own T3 code. It stubs out `Box.Application` and provides methods to access modules, service, and behavior objects directly. This way, you can directly interact with object for testing purposes.

## Installation

The `t3-testing.js` file is located in the `/dist` directory. Depending on how you've [installed](../installation) T3, you may access this file in a few different ways:

```html
<!-- if you have installed using npm -->
<script src="./node_modules/dist/t3-testing.js"></script>

<!-- if you're using the CDN with a specific version -->
<script src="//cdn.rawgit.com/box/t3js/{{ site.data.t3.version }}/dist/t3-testing.js"></script>

<!-- if you're using a local copy -->
<script src="/path/to/t3/t3-testing.js"></script>
```

**Note:** Make sure you do *not* include the regular `t3.js` file in your tests.

## Box.TestServiceProvider

Since services get used quite frequently in T3, the testing bundle has a special `Box.TestServiceProvider` type that is used to easily wire up an object with a `getService()` method that responds with appropriate objects. When you create a new instance of `Box.TestServiceProvider`, you pass in an object with key-value pairs corresponding to the service name and an object to return when that service name is requested. Here's an example:

```js
var service1Fake = {},
    service2Fake = {};

var contextFake = new Box.TestServiceProvider({
    // name : object to return
    service1: service1Fake,
    service2: service2Fake
});

contextFake.getService('service1') === service1Fake;    // true
contextFake.getService('service2') === service2Fake;    // true
```

This code sets up a fake `context` object for a test by using a `Box.TestServiceProvider` that is wired up to return two services: `service1` and `service2`. Each of these names are tied to fake service objects that should be returned when `getService()` is called. In this way, you can quickly write up service dependencies for your tests.

### How to Use a Real Service

Occasionally, you will need to use an actual service instead of a stub. A DOM manipulation service is a great example of a utility that is hard to stub/fake short of just re-implementing the functionality in the test. `Box.TestServiceProvider` will include any services that are registered to the application stub before the `Box.TestServiceProvider` is instantiated, provided that you specify the services in the 2nd param, `allowedServicesList` of a TestServiceProvider. For example:

```js

// services/dom.js
Box.Application.addService('dom', function(application) {
    return {
        ...
        addClass: function(element, class) {
            ...
        }
    };
});
```

```js
// *** include services/dom.js via <script> or test config ***
// path/to/test-file.js
var service1Fake = {};
var contextFake = new Box.TestServiceProvider({
    // name : object to return
    service1: service1Fake
}, ['dom']);
var domService = contextFake.getService('dom'); // Return the actual `dom` service.
```

**Note:** The component being tested will use the real service. That does not prevent you from stubbing or mocking methods as normal.

## Box.Application Stub

The T3 testing bundle stubs out `Box.Application` so you can focus on testing just your components in an isolated environment. This stub contains the `addModule()`, `addService()`, and `addBehavior()` methods that are used to register components, so your components are never aware they aren't running with the real `Box.Application`.

Additionally, there are three methods on the `Box.Application` stub that allow you to get access to T3 components:

* `getModuleForTest(moduleName, contextFake)` - returns the module object for the given module name and passes `contextFake` as the `context` object to the module's creator function.
* `getServiceForTest(serviceName, applicationFake)` - returns the service object for the given module name and passes `applicationFake` as the `application` object to the service's creator function.
* `getBehaviorForTest(behaviorName, contextFake)` - returns the behavior object for the given behavior name and passes `contextFake` as the `context` object to the behavior's creator function.

Each of these methods allow you to inject an object in place of the `context` or `application` object that is typically passed to the component's creator function. This allows you to substitute in a `Box.TestServiceProvider`, or any other object, to aid in testing. For example:

```js
var service1Fake = {},
    service2Fake = {};

var contextFake = new Box.TestServiceProvider({
    // name : object to return
    service1: service1Fake,
    service2: service2Fake
}, ['some-real-service']);

// use this to get a reference to the module being tested
var module = Box.Application.getModuleForTest('mymodule', contextFake);
```

In general, `getModuleForTest()`, `getServiceForTest()`, or `getBehaviorForTest()` should only be called once for each unit test and should be used only to retrieve the component you are testing.
