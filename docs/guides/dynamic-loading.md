---
layout: documentation
title: Dynamic Loading of Modules
prev: testing-services
---

# Dynamic Loading of Modules

Even though T3 is built with progressive enhancement in mind, that doesn't mean you can't dynamically load new modules at runtime. T3 has some lower-level functionality that gives you fine-grained control over module lifecycle, so it's straightforward to stop or start modules whenever you want.

## Injecting HTML

Since a module is represented by a DOM element, it's up to you to decide where the DOM element lives in a page. For the purposes of dynamic loading, you may want to have an empty container element somewhere on the page, such as:

```html
<div id="sidebar"></div>
```

Note that this isn't marked as a T3 module, it's just a location for a module to be inserted.

The first step is to retrieve some HTML from the server and insert it into the container, such as:

```js
// note: html comes from server
function loadSidebar(html) {
    var sidebarElement = document.getElementById('sidebar');
    sidebarElement.innerHTML = html;

    // more to come
}
```

Assuming `html` contains an element with a `data-module` attribute, calling this method will inject the module HTML into the container.

## Start the Module(s)

There are two ways to start modules: `Box.Application.start()` and `Box.Application.startAll()`. The former is used to start a single module while the latter is used to start all modules within a particular DOM element. So if you expect to have just one module, and you know the element on which `data-module` exists, then you can pass the element directly, such as:

```js
// note: html comes from server
function loadSidebar(html) {
    var sidebarElement = document.getElementById('sidebar');
    sidebarElement.innerHTML = html;

    // assuming firstChild has data-module
    Box.Application.start(sidebarElement.firstChild);
}
```

If, however, you're unsure of the module element or you are loading multiple modules within a single element, you may want to use `Box.Application.startAll()` instead:

```js
// note: html comes from server
function loadSidebar(html) {
    var sidebarElement = document.getElementById('sidebar');
    sidebarElement.innerHTML = html;

    // don't know which element(s) have data-module
    Box.Application.startAll(sidebarElement);
}
```

In either case, the module will start and go through its normal lifecycle.

**Note:** It's still up to you to properly load the JavaScript containing the module definition. Without it, you'll get an unknown module error when attempting to start the module.

## Stopping Module(s)

On the other side, it's useful to stop modules in order to unload them. You can use `Box.Application.stop()` or `Box.Application.stopAll()` to stop already-started modules. As with `start()` and `startAll()`, these methods work on a single module element or a container element, respectively. If the sidebar in the example code wasn't already empty, you might want to stop any existing modules before removing the HTML, such as:

```js
// note: html comes from server
function loadSidebar(html) {
    var sidebarElement = document.getElementById('sidebar');

    // stop all existing modules
    Box.Application.stopAll(sidebarElement);

    // replace the HTML
    sidebarElement.innerHTML = html;

    // start all new modules
    Box.Application.startAll(sidebarElement);
}
```

This is a pattern we use frequently for dynamically loading modules.
