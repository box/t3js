---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/passing-messages/
prev: create-the-modules
prev_title: Create the Modules
next: event-handlers
next_title: Event Handlers
---

# Passing Messages

Now that you have all of your encapsulated modules on that page, you can get our JavaScript in there to do the job of creating memes. There's one problem: how does the `meme-menu` module communicate with the `meme-generator` module? The menu is handling the input values that need to update the overlay text on the image. This type of communication is handled by T3 and it is known as *messages*, which is an implementation of the publisher-subscriber (pubsub) pattern.

T3 modules use `context.broadcast()` to send out messages to any module that is listening. This broadcast is received by the module's `onmessage` method. By using the `messages` array on the public interface, the module explicitly defines which messages it is listening to.

## Using Messages

To make the application work, you need pass a message from the `meme-menu` module that will update the `meme-generator` module. You can have the modules agree that the message to update the text will be called `memetextchanged`. The second parameter to the `context.broadcast()` method is a value is sent to message subscribers. For this example, the second paramteter contains an object with the text field to change and the text to insert into that field. You can make the `meme-menu` broadcast this message when it is initialized:

{% highlight javascript %}
// In the meme-menu's returned interface, edit the init function
Box.Application.addModule('meme-menu', function(context) {

  return {

    init: function() {
        context.broadcast('memetextchanged', {
            direction: 'top',
            value: 'New meme text!'
        });
    },

    ...

  };

}
{% endhighlight %}

As the module broadcasts this message, you need to update the code in the `meme-generator` module to listen for it. You need to do two things, first edit the messages the modules wants to receive (the `messages` key) and then have the module react in the `onmessage` method.

Adding the message to the public interface is as easy as appending a new entry into the `messages` key's array, it should look something like this:

{% highlight javascript %}
return {
  messages: ['memetextchanged'],
  init: function() {...},
  onclick: function() {...},
  onmessage: function() {...}
};
{% endhighlight %}


In the `onmessage` method for the `meme-generator` module, you can extract the text values from the message data and update the UI accordingly.

So to get started with modifying the actual UI to change text, find the elements you will be changing. The two text fields
are:

{% highlight html %}
  <input class="bottom-text-input" type="text" placeholder="Top text">
  <input class="top-text-input" type="text" placeholder="Bottom text">
{% endhighlight %}

To be a more efficient with your module code, cache the element selectors into private scope variables (before the `return`). Make sure to use `init` function to cache element look-ups (do not cache as part of the declaration).

{% highlight javascript %}
Box.Application.addModule('meme-generator', function(context) {
  'use strict';

  // Private vars
  var topTextEl,
      bottomTextEl;

  return {
    init: function() {
      topTextEl = document.querySelector('.top-container.meme-text');
      bottomTextEl = document.querySelector('.bottom-container.meme-text');
    }

  };
  ...
});
{% endhighlight %}

You can use the private module-scoped variables any module method. To add the message handling in the `meme-generator` module, add a `case` for the `memetextchanged` message. The HTML should be updated depending on the `direction` of the label. Completing this step yields:

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

The `memetextchanged` message broadcast from the `meme-menu` module will trigger the `meme-generator` module to change the text of the top and bottom label when the module is initialized.

But wait a minute, the text fields don't change the text yet. You need event handlers and T3 provides just the right thing. Come with me and I'll show you!
