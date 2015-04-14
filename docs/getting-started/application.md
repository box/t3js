---
layout: documentation
title: Application
prev: installation
next: module
---

# Creating an Application

The most important object in T3 is `Box.Application`. This object is responsible for managing all components on the page: modules, services, and behaviors. It keeps track of the components as well as managing their lifecycle.

## Initialization

Any page you want to use T3 on needs to initialize the application using the `init()` method. For example:

```js
Box.Application.init();
```

Exactly where and when you call `init()` depends on when you want to start the application lifecycle. Some of the places where it's appropriate to call `init()` include:

* Inline at the bottom of the page
* In a `window.onload` event handler
* In a `DOMContentLoaded` event handler

The only prerequisite to calling `init()` is that you have already loaded the T3 components that are required for the page.

## Global Configuration

It's possible your application may need to share some configuration with its components. To do so, you can pass an object to `init()` specifying the additional information that should be available. For example:

```js
Box.Application.init({
    apiKey: 'abcxyz123'
});
```

In this case, the property `apiKey` will be available to all T3 components.

## Debug Mode

Although configuration information is mostly inert, there is one special configuration option that causes a change in how T3 behaves. The `debug` property is used to indicate that the application is in debug mode.

```js
Box.Application.init({
    debug: true;
});
```

Debug mode means that all errors are thrown and, as such, will show up in the browser console. When debug mode is off (by default), errors instead cause the `error` event to be emitted. You can then listen for errors with an event handler, such as:

```js
Box.Application.on('error', function(event) {

    var exception = event.exception;

    // do something with the exception
});
```

This capability is provided so that it's possible to detect errors in T3 components and take appropriate action. In production, for example, you may want to log these errors to the server. T3 is capable of catching most thrown errors in T3 components automatically, so you don't need to use `try-catch` statements to keep the application from crashing due to a thrown error.

We recommended that you set `debug` to true when in development to make it easier to debug errors as they occur and set `debug` to false for production environments.
