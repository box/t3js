---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/create-the-modules/
prev: initial-setup
prev_title: Initial Setup
next: passing-messages
next_title: Passing Messages
---

# Create the Modules

The purpose of this tutorial is to create two T3 modules using the T3 Yeoman generator. The first module is responsible for updating the text and background image in the top portion of the application. The second module is responsible for handling the inputs and image menu at the bottom.

## Scaffolding with Yeoman

To create a module with Yeoman, use this command on the terminal:

```
yo t3
```

After that, you'll be presented with some options. Follow these steps:

1. From the dropdown, choose `Module`.
1. Name the module `meme-generator`.

You've just made your first module. Now make a second module called `meme-menu` using the same steps.

You now have two scaffolded files in the `js/modules/` directory. Open those modules up and take a look at what's inside.

The module is initialized and registered with the global `Application` object. It returns it's standard defined interface — `init` and `destroy`. There are methods that deal with messages and events — `onclick` and `onmessage`.


```
Box.Application.addModule('meme-generator', function(context) {

  'use strict';

  return {
    messages: [],

    init: function() {
      // code to be run when module is started
    },

    destroy: function() {
      // code to be run when module is stopped
    },

    onclick: function(event, element, elementType) {
      // code to be run when a click occurs
    },

    onmessage: function(name, data) {
      // code to be run when a message is received
    }
  };

});
```

## Bring the Modules to Life

Next you'll integrate the modules into the application, this is accomplished by doing two things: adding the `.module` class to the HTML element you want to be the *root element* of the module and adding a `data-module` attribute with the name of the module. When the application is initialized, T3 will look for all of the DOM nodes with these characteristics. The module specified in `data-module` attribute will be automatically created and initialized to represent that element.

Add the `meme-generator` module to the `.meme-container` HTML element and the `meme-menu` module to the `.meme-menu` HTML element. The result looks like this:

{% highlight html %}
<div class="meme-container module" data-module="meme-generator">
  ...
</div>

<div class="meme-menu module" data-module="meme-menu">
  ...
</div>
{% endhighlight %}

Now the `onclick` and other DOM event methods will be triggered by events in any DOM node under the root node of the module. This encapsulation of modules on the page provides a clear way to map modules to sections of the page. Next we will have the modules communicate through each other by passing messages. Onward!
