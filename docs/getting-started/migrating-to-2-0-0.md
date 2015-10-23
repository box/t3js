---
layout: documentation
title: Migrating from 1.5.1 to 2.0.0
---

# Migrating from 1.5.1 to 2.0.0

The latest version of T3 contains major improvements to robustness and testability. We have listed the breaking changes are listed here:

#### Native DOM is now the default

We've switched the default t3 package to use native by default (IE9+). If you would like to use the jQuery version, please use the t3-jquery-2.x.x.js distribution file.

#### Including duplicate behaviors throw errors

```js
Box.Application.addService('some-module', function(application) {
    return {
        behaviors: ['behavior1', 'behavior2', 'behavior1'] // Error
    };
});
```

#### Behaviors init() before module init()

This should allow the modules to rely on any required setup from the behaviors.

```js
Box.Application.addBehavior('some-behavior', function(context) {
	return {
		init: function() {
			console.log('foo');
		}
	};
});
```

```js
Box.Application.addModule('some-module', function(context) {
	return {
		behavior: ['some-behavior'],

		init: function() {
			console.log('bar');
		}
	};
});
```

```
Box.Application.start('[data-module="some-module"]');

Outputs:
foo
bar
```

#### getService() throws errors when the service does not exist

```js
application.getService('non-existent-service'); // Error
```

Previously, this would return null. Use `hasService()` to check for optional services.

```js
var service = application.hasService('some-service')
		? application.getService('some-service') : null;
```
This change will allow developers to catch issues with missing services before they hit production.

#### TestServiceProvider requires explicit pre-registered services

```js
beforeEach(function() {
	var context = new Box.TestServiceProvider({
		service1: {
			foo: function() {}
		}
	}, ['dom', 'promises']); // List of services used but not stubbed
	...
});
```
This will prevent accidental leakage of services between unit tests.
