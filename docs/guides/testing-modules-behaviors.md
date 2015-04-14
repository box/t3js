---
layout: documentation
title: Testing Modules
prev: testing-bundle
next: testing-services
---

# Testing Modules and Behaviors

Modules and behaviors are designed to be completely unit testable, meaning that they need not have all of their dependencies included to be tested. You can use any JavaScript testing framework you prefer to test T3 modules. This guide shows examples in [QUnit](https://qunitjs.com) and [Mocha](http://mochajs.org) (with [Chai](http://chaijs.com)), but you should feel free to use your favorite testing framework.

**Note:** Be sure to have the [T3 testing bundle](testing-bundle) loaded for your module tests.

## Testing Similarities

Modules and behaviors are so similar that they can be tested in the same ways. For every module testing example on this page, the same process can be used to test behaviors. You'll use `getModuleForTest()` to retrieve a module instance for testing and `getBehaviorForTest()` to retrieve a behavior instance for testing. Outside of this difference, everything else is exactly the same for testing modules and behaviors.

For both modules and behaviors, you'll want to double-check whether or not to call `init()` and `destroy()` after each test. The examples in this guide assume each module has both `init()` and `destroy()`.

## Modules with No Dependencies

If you're writing a simple module that has no dependencies on other components or the `context` object, then you can use the following basic formats for your tests.

### QUnit

Create a new `QUnit.module` and give it the same name as your module (note that `QUnit.module` has nothing to do with T3 module). In the `beforeEach()` method, call `getModuleForTest()` to retrieve a reference to the module object and store it in `this.module`. Then, you can write as many tests as you want referencing methods on the `this.module`. Here's a simple example:

```js
QUnit.module('modules/module-name', {

    beforeEach: function() {
        this.module = Box.Application.getModuleForTest('module-name');

        this.module.init();
    },

    afterEach: function() {
        this.module.destroy();
    }

});

QUnit.test('first test', function() {

    this.module.doSomething();

    // include asserts here
});
```

### Mocha

For Mocha testing, create a `describe` with the name of your module. In the `beforeEach()` function, call `getModuleForTest()` to retrieve a reference to the module object. For each method you want to test, include another `describe` section, and then however many `it` tests you need to cover the functionality. For example:

```js
describe('modules/module-name', function() {
    var module;

    beforeEach(function() {
        module = Box.Application.getModuleForTest('module-name');
        module.init();
    });

    afterEach(function() {
        module.destroy();
    });

    describe('someMethod()', function() {

        it('should do something when called', function() {
            module.someMethod();

            // asserts go here
        });
    });
});
```

## Testing with Context Object and Services

If your module depends on the `context` object to perform its tasks, then you'll need to stub it out. To do so, create a new instance of `Box.TestServiceProvider`, which is provided in the [testing bundle](../testing-bundle). This object allows you to specify stub services for use in your test. These examples use [Sinon](http://sinonjs.org) as a stubbing library.

Assume you have a module defined as:

```js
Box.Application.addModule('module-name', function(context) {


    return {
        doSomething: function() {
            // delegate to a service
            var anotherService = context.getService('another-service');
            anotherService.doSomething();
        }
    };

});
```

Writing a test for this module is fairly straightforward. The first thing to do is create a service stub called `anotherService` that has the methods you want the module to call. Then, a `Box.TestServiceProvider` is created an initialized with `anotherService`. This becomes a fake version of the `context` object that is normally passed into a module. That fake `context` is then passed to `getModuleForTest()` so the module can get access to it.


### QUnit

```js
QUnit.module('modules/module-name', {

    beforeEach: function() {

        // the service object you depend on
        var anotherService = {
            doSomething: sinon.stub().returns(null)
        };

        // a fake context object that returns that service
        var contextFake = new Box.TestServiceProvider({
            'another-service': anotherService
        });

        this.module = Box.Application.getModuleForTest('module-name', contextFake);
        this.module.init();

        this.sandbox = sinon.sandbox.create();
    },

    afterEach: function() {
        this.module.destroy();
        this.sandbox.verifyAndRestore();
    }
});

QUnit.test('should call doSomething() on the service', function() {
    this.sandbox.mock(anotherService).expects('doSomething');
    this.module.doSomething();
});
```

### Mocha

```js
describe('modules/module-name', function() {
    var module,
        sandbox = sinon.sandbox.create(),
        anotherService = {
            doSomething: sandbox.stub().returns(null)
        };

    beforeEach(function() {
        // a fake context object that returns that service
        var contextFake = new Box.TestServiceProvider({
            'another-service': anotherService
        });

        // you may need to add additional methods to context
        contextFake.getElement = sandbox.stub().returns(null);

        module = Box.Application.getModuleForTest('module-name', contextFake);
        module.init();
    });

    afterEach(function() {
        module.destroy();
        sandbox.verifyAndRestore();
    });

    describe('someMethod()', function() {

        it('should call doSomething() on anotherService when called', function() {
            sandbox.mock(anotherService).expects('doSomething');
            module.someMethod();
        });

    });
});
```

## Testing Event Handlers

When you want to test how an event handler works, call the method directly on the module object and pass in an event object as the argument. You should fill in only the event properties that you are using within the event handler. For instance, suppose you have this module:

```js
Box.Application.addModule('module-name', function(context) {
    return {
        onclick: function(event, element, elementType) {
            if (elementType === 'menu-btn') {
                this.showMenu();
            }
        },
        showMenu: function() {
            // menu logic
        }

    };
});
```

In this case, you want to test `onclick()` to see that when an element with the class name of `"menu-btn"` is clicked, the method `showMenu()` is called. You would not, however, want to test exactly what `showMenu()` is doing (that should be in a separate test where `showMenu()` is called directly). For the event handler, you simply want to test that the method was called as a result of the element that was clicked. To do so, you can use a Sinon mock on the `showMenu()` method to verify that it was called.

### QUnit

```js
QUnit.module('modules/module-name', {

    beforeEach: function() {
        this.sandbox = sinon.sandbox.create();

        var contextFake = new Box.TestServiceProvider();
        this.module = Box.Application.getModuleForTest('module-name', contextFake);
        this.module.init();
    },

    afterEach: function() {
        this.module.destroy();
        this.sandbox.verifyAndRestore();
    }
});

QUnit.test('Clicking an element with "show-menu" type should call showMenu()', function() {

    // say that the method should be called
    this.sandbox.mock(this.module).expects('showMenu');

    // create event object with correct target using jQuery
    var target = $('[data-type=menu-btn]')[0];
    var event = $.Event('click', {
        target: target
    });

    // call the method to test
    this.module.onclick(event, target, 'show-menu');
});
```

### Mocha

```js
describe('modules/module-name', function() {
    var sandbox = sinon.sandbox.create(),
        module;

    beforeEach(function() {
        var contextFake = new Box.TestServiceProvider();
        module = Box.Application.getModuleForTest('module-name', context);
        module.init();
    });

    afterEach(function() {
        module.destroy();
        sandbox.verifyAndRestore();
    });

    describe('someMethodThatNeedsConfig()', function() {

        it('should call showMenu() when menu-btn is clicked', function() {
            sandbox.mock(module).expects('showMenu');

            // create event object with correct target using jQuery
            var target = $('[data-type=menu-btn]')[0];
            var event = $.Event('click', {
                target: target
            });

            module.onclick(event, target, 'menu-btn);
        });

    });
});

```

## Testing with Configuration Data

If your module uses configuration data, then you must also stub out the `getConfig()` method for tests. Be sure to include all configuration keys your module needs.

### QUnit

```js
QUnit.module('My module name', {

    beforeEach: function() {

        var contextFake = new Box.TestServiceProvider();

        // stub out getConfig
        contextFake.getConfig = this.stub().returns({
            'special_url': '/special',
            'items_per_page': 5
        });

        this.module = Box.Application.getModuleForTest('module-name', contextFake);
        this.module.init();
    },

    afterEach: function() {
        this.module.destroy();
    }
});

QUnit.test('first test', function() {

    this.module.someMethodThatNeedsConfig();

    // include asserts here
});
```

### Mocha

```js
describe('modules/module-name', function() {
    var sandbox = sinon.sandbox.create(),
        module;

    beforeEach(function() {
        var contextFake = new Box.TestServiceProvider();

        // stub out getConfig()
        context.getConfig = sandbox.stub().returns({
            special_url: '/special',
            items_per_page: 5
        });
        module = Box.Application.getModuleForTest('module-name', context);
        module.init();
    });

    afterEach(function() {
        module.destroy();
        sandbox.verifyAndRestore();
    });

    describe('someMethodThatNeedsConfig()', function() {

        it('should call doSomething() when called', function() {
            module.someMethodThatNeedsConfig();

            // include asserts here
        });

    });
});
```
