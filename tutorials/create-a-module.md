---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/create-a-module/
prev: initial-setup
prev_title: Initial Setup
next: passing-messages
next_title: Passing Messages
---

# Create a Module

In this step we will be creating a T3 module with Yeoman. There will be two modules: one that is responsible for updating the text and background image that is at the top portion of the application and another that is responsible handling the inputs and image menu at the bottom.
Let's go ahead and create our first module, we will be doing this using Yeoman and this will facilitate being able to consistently scaffold files within our application.

## Scaffolding with Yeoman

To create a module with Yeoman, use the command on the terminal:

```
yo t3
```

From the dropdown, choose `Module`. Name the module `meme-generator`. Do this again for a module named `meme-menu`. We now have two scaffolded files in the `js/modules/` directory. Let's open those modules up and take a look at what's inside.

The module is initialized and registered with the global `Application` object. It returns it's standard defined interface — `init` and `destroy`. There are methods that deal with messages and events — `onclick` and `onmessage`.

## Bring the Modules to Life

Now we'll integrate the modules into the application, this is done by doing two things: adding the `.module` class to the HTML element we want to be the *root element* of the module and adding a `data-module` attribute with the name of our module. When the application is initialized T3 will look for all of the DOM nodes that qualify as modules and will attach the module in the `data-module` attribute to this HTML element.

Let's add the `meme-generator` module to the `.meme-container` HTML element and the `meme-menu` module to the `.meme-menu` HTML element. The result should be what is below:

{% highlight html %}
<div class="meme-container module" data-module="meme-generator">
  ...
</div>

<div class="meme-menu module" data-module="meme-menu">
  ...
</div>
{% endhighlight %}

Now the the `onclick` and other DOM event methods will be triggered for this module when any DOM node under the root node of the module is affected. This encapsulation of modules on the page provides a clear way to map modules to sections of the page. Next we will have the modules communicate through each other by passing messages. Onward!
