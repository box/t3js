---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/passing-messages/
prev: create-a-module
prev_title: Create a Module
next: event-handlers
next_title: Event Handlers
---

# Passing Messages

Now that we have all of our encapsulated modules on that page, we can get our JavaScript in there to do the job of creating memes. There's one problem: how does the `meme-menu` module communicate with the `meme-generator` module? The menu is handling the input values that need to update the overlay text on the image. This type of communication is handled by T3 and it is known as *messages*.

Similar to a publisher-subscriber model, T3 components are able to use the global `Application.broadcast` method to send out messages to anyone who is listening. This broadcast can be captured by the modules `onmessage` method. By using the `messages` array on the public interface, the module will be able to explicitly defined which messages it is listening to.

## Using Messages

Let's use messages in our application. Essentially what we need to do is pass a message from the `meme-menu` module that will update the `meme-generator` module. We can have the modules agree that the message to update the text will be called `memetextchanged`. The second parameter to the `Application.broadcast` method is an object that will be sent to listeners of the message, this will contain the text and which text field needs to be updated. As a first check let's make the `meme-menu` broadcast this message with it is initialized:

{% highlight javascript %}
// In the meme-menu's returned interface, let's edit the init function
init: function() {
  Application.broadcast('memetextchanged', {
    direction: 'top',
    value: 'New meme text!'
  });
};
{% endhighlight %}

As the module broadcasts this message we need to update the code in the `meme-generator` module to listen for this message. We will need to do two things, first edit the messages we care about on the public interface of the module (the `messages` key) and then have the module react in the `onmessage` method for this message.

Adding the message to the public interface is as easy as appending a new entry into the `messages` key's array, it should look something like this:

{% highlight javascript %}
return {
  messages: ['memetextchanged'],
  init: function() {...},
  onclick: function() {...},
  onmessage: function() {...}
};
{% endhighlight %}

In our `onmessage` method for the `meme-generator` module we can extract the text values from the message data and update the UI accordingly. Let's add a `switch` that will have `case`s for messages. In the private module scope (before the `return`) we can cache values that will be used again, let's store the elements for the text tags.

{% highlight javascript %}
Application.addModule('meme-generator', function() {
  'use strict';

  var topTextEl = document.querySelector('.top-container.meme-text'),
      bottomTextEl = document.querySelector('.bottom-container.meme-text');
  ...
});
{% endhighlight %}

We can use the private module-scoped variables in the public interface. Now let's add the message handling in the `meme-generator` module, we will `case` the `memetextchanged` message and depending on the `direction` of the label we will update the HTML accordingly. This should look like something below:

{% highlight javascript %}
onmessage: function(name, data) {
  switch(name) {
      case 'memetextchanged':
        switch (data.direction) {
          case 'top':
            topTextEl.innerHTML = data.value;
            break;

          case 'bottom':
            bottomTextEl.innerHTML = data.value;
            break;
          // no default
        }
        break;
  }
}
{% endhighlight %}

Great! We should be able to update the text of the top and bottom label when the modules are initialized. But wait a minute, we can't even update the text from the input text fields. T3 handles this by having event handler methods on the public interface of the modules. Come with me and I'll show you!
