---
layout: tutorial
title: T3 Javascript Framework - Tutorials
permalink: /tutorials/event-handlers/
prev: passing-messages
prev_title: Passing Messages
next: use-a-service
next_title: Use a Service
---

# Event Handlers

Now that we have two modules on the page that can communicate with each other, there is only one missing link: communication with the user. User-triggered events are handled by the T3 framework and events are delegated to the nearest ancestor DOM node that is a T3 module. In the framework there are methods similar to `onmessage` that are for DOM events, they are all prefixed with `on` and prepended with the standard DOM event names. For example, T3 modules that want to handle click events simply have to implement an `onclick` function on their public interface. These functions will pass the triggered event, the module element, and the `data-type` attribute from the target element of the event (more on this in a moment). With these sources of information we will be able to capture any event, have the module do it's thing, and broadcast the event in the case that anybody else cared this happen (they won't know since this it's not their module element scope).

## Using Events

Let's handle some events in our application. For now what we want to do is capture the `keyup` event that is triggered on the input fields, take the changed value, and do the same broadcast we are in `meme-menu.init`. First we will have to add the public interface method that will handle the `keyup` event, it'll look something like below:

{% highlight javascript %}
return {
  init: function() {...},
  onclick: function() {...},
  onmessage: function() {...},
  onkeyup: function(event, element, elementType) {
    // We'll do our magic in here
  }
};
{% endhighlight %}

This `onkeyup` event won't get triggered with enough data (which input field), we will have to decorate the HTML elements with the `data-type` attribute and that will populate the `elementType` parameter. The HTML for the `<input>`s is simple:

{% highlight html %}
<input class="bottom-text-input" type="text" data-type="top-input">
<input class="top-text-input" type="text" data-type="bottom-input">
{% endhighlight %}

Now implementing `onkeyup` is straightforward, we will extract the data from the target element from the event and get the label we should update — the broadcast will remain the same as before.

{% highlight javascript %}
onkeyup: function(event, element, elementType) {
  var direction = elementType.split('-input')[0],
      value = event.originalEvent.target.value;

  Application.broadcast('memetextchanged', {
    value: value,
    direction: direction
  });
}
{% endhighlight %}

Excellent! When we type we should see the overlay text labels get updated whenever a key is pressed in one of the input fields.

## Exercise

That was fun, right? Now it's your turn! Let's synthesize all the concepts we learned in the T3 framework and do some magic.

The exercise is to update the meme's image when one of the thumbnails are clicked. You can check out which the images that are available in the `img/full/` directory. This should encompass creating a new message that is broadcasted and event handling. Have it at and we'll meet up again at the next step!
