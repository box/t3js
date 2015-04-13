---
layout: documentation
title: Testing Services
---

# Testing Services

Services are designed to be completely unit testable, meaning that they need not have all of their dependencies included to be tested. You can use any JavaScript testing framework you prefer to test T3 modules. This guide shows examples in [QUnit](https://qunitjs.com) and [Mocha](http://mochajs.org) (with [Chai](http://chaijs.com)), but you should feel free to use your favorite testing framework.

**Note:** Be sure to have the [T3 testing bundle](../testing-bundle) loaded for your module tests.

## Services with No Dependencies

If you're writing a simple service that has no dependencies on other components or the `application` object, then you can use the following basic formats for your tests.

### QUnit

```js
QUnit.module('service-name', {

    beforeEach: function() {

        // retrieve a reference to the service to test
        this.service = Box.Application.getServiceForTest('service-name');
    }
});

QUnit.test('doSomething() should x when y', function() {

    this.service.doSomething();

    // include asserts here
});
```

### Mocha

```js
describe('services/service-name', function() {
    var service;

    beforeEach(function() {
        // retrieve a reference to the service to test
        service = Box.Application.getServiceForTest('service-name');
    });

    describe('doSomething()', function() {

        it("should x when y", function() {
            service.doSomething();
            // include asserts here
        });
    });
});
```

## Testing Services with Dependencies

If your service depends on the application object to perform its tasks, then you'll need to stub it out. To do so, create a new instance of `Box.TestServiceProvider` (from the [testing bundle](../testing-bundle).

### QUnit

```js
QUnit.module('service-name', {
    beforeEach: function() {

        this.sandbox = sinon.sandbox.create();

        // the service object you depend on
        var anotherService = {
            doSomething: this.sandbox.stub().returns(null);
        };

        // a fake application object that returns that service
        var application = new Box.TestServiceProvider({
            'another-service': anotherService
        });

        // retrieve a reference to the service to test
        this.service = Box.Application.getServiceForTest('service-name', application);
    },

    afterEach: function() {
        this.sandbox.verifyAndRestore();
    }
});

QUnit.test('doSomething() should x when y', function() {
    this.service.doSomething();

    // include asserts here
});
```

### Mocha

```js
describe('services/service-name', function() {
    var service;
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {

        // the service object you depend on
        var anotherService = {
            doSomething: sandbox.stub().returns(null);
        };

        // a fake application object that returns that service
        var application = new Box.TestServiceProvider({
            'another-service': anotherService
        });

        // retrieve a reference to the service to test
        service = Box.Application.getServiceForTest('service-name', application);
    });

    afterEach(function() {
        sandbox.verifyAndRestore();
    });

    describe('doSomething()', function() {
        it('should x when y', function() {

            service.doSomething();

            // include asserts here
        });
    });
});
```

To create a true unit test, you need to create a stub for each service that your code depends on. This example creates a stub service called "another-service". The call to new `Box.TestServiceProvider()` includes a name-value list of service names and objects that should be returned for that name. The returned object is then passed in as the second argument to `Box.Application.getServiceForTest()` so that it becomes available inside of the service creator function.
