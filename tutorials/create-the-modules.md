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

The purpose of this part of the tutorial is to create the two T3 modules. The first module is responsible for updating the text and background image in the top portion of the application. The second module is responsible for handling the inputs and image menu at the bottom.

## Setting up the Modules

Now you will be creating two modules for the meme generator, there are module templates available in `templates/module.js`. This will be the scaffold, copy this template into `js/modules` and name the files `meme-generator` and `meme-menu`.

Open those modules up and take a look at what's inside.

The module is initialized and registered with the global `Application` object. The two parameters passed in are the module's name and the module definition, the module name should be `'meme-generator'` and `'meme-menu'` for each file respectively.

The module returns a standard defined interface — `init` and `destroy`. There are methods that deal with messages and events — `onclick` and `onmessage`.

```
Application.addModule('meme-generator', function(context) {

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

The final step to get the modules on the page is to include them in a script tag at the bottom of the `<body>` element in `index.html`:

```
<script src="js/modules/meme-generator.js"></script>
<script src="js/modules/meme-menu.js"></script>
```

## Bring the Modules to Life

Next you'll integrate the modules into the application, this is accomplished by doing two things: adding the `.module` class to the HTML element you want to be the *root element* of the module and adding a `data-module` attribute with the name of the module. When the application is initialized, T3 will look for all of the DOM nodes with these attributes. The module specified in `data-module` attribute will be automatically created and initialized to represent that element.

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
