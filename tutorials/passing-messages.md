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

Now that you have all of your encapsulated modules on that page, you can get our JavaScript in there to do the job of creating memes. There's one problem: how does the `meme-menu` module communicate with the `meme-generator` module? The menu is handling the input values that need to update the overlay text on the image. This type of communication is handled by T3 and it is known as *messages*, which is an implementation of the publisher-subscriber (pubsub) pattern.

T3 modules use `context.broadcast()` to send out messages to any module that is listening. This broadcast is received by the module's `onmessage` method. By using the `messages` array on the public interface, the module explicitly defines which messages it is listening to.

## Using Messages

To make the application work, you need pass a message from the `meme-menu` module that will update the `meme-generator` module. You can have the modules agree that the message to update the text will be called `memetextchanged`. The second parameter to the `context.broadcast()` method is a value is sent to message subscribers. For this example, the second paramteter contains an object with the text field to change and the text to insert into that field. You can make the `meme-menu` broadcast this message when it is initialized:

{% highlight javascript %}
// In the meme-menu's returned interface, edit the init function
init: function() {
  context.broadcast('memetextchanged', {
    direction: 'top',
    value: 'New meme text!'
  });
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

NCZ: This is missing some transitional sentences. Right now there's a big gap in the story that I don't know how to fix. The previous sentence and the next one just don't flow.

In the private module scope (before the `return`) you can cache values that will be used again, let's store the elements for the text tags.

{% highlight javascript %}
Application.addModule('meme-generator', function() {
  'use strict';

// NCZ: this should not be done here. Look up these elements in init().
  var topTextEl = document.querySelector('.top-container.meme-text'),
      bottomTextEl = document.querySelector('.bottom-container.meme-text');
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

NCZ: This paragraph is too passive. "should be to". Explain what the code is actually doing right now.

Great! You should be able to update the text of the top and bottom label when the modules are initialized. But wait a minute, we can't even update the text from the input text fields. T3 handles this by having event handler methods on the public interface of the modules. Come with me and I'll show you!
