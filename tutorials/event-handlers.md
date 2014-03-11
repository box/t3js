---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/event-handlers/
prev: passing-messages
prev_title: Passing Messages
next: use-a-service
next_title: Use a Service
---

# Event Handlers

Now that you have two modules on the page that can communicate with each other, there is only one missing link: communication with the user. User-triggered events are handled by the T3 framework and events are delegated to the nearest ancestor DOM node that is a T3 module. In the framework, there are methods similar to `onmessage` that are for DOM events, and they use the classic DOM event handler names beginning with `on` (such as `onclick`).

NCZ: Info presented out of order. Show people how to use data-type and then tell them about onclick.

These functions pass the triggered event, the module element, and the `data-type` attribute from the target element of the event (more on this in a moment). With these sources of information you will be able to capture any event, have the module do it's thing, and broadcast the event in the case that anybody else cared this happen (they won't know since this it's not their module element scope).

## Using Events

You need only add a method for the event you want to listen for in the module's public interface. You'll need to listen for the `keyup` event, so add a method called `onkeyup`, such as:

{% highlight javascript %}
return {
  init: function() {...},
  onclick: function() {...},
  onmessage: function() {...},
  onkeyup: function(event, element, elementType) {
    // You'll do your magic in here
  }
};
{% endhighlight %}

The `onkeyup` event handler is called for any `keyup` events occurring within the module. The second and third parameters, however, won't be provided until you decorate the HTML elements with a `data-type` attribute. Whenever an event occurs, the framework starts looking up the DOM tree to find the nearest element that has a `data-type` attribute. That element is returned as the second argument to `onkeyup`. The value of `data-type` is passed as the third argument.

So to distinguish which textbox is triggering the event, add a unique `data-type` value:

{% highlight html %}
<input class="bottom-text-input" type="text" data-type="top-input">
<input class="top-text-input" type="text" data-type="bottom-input">
{% endhighlight %}

Now implementing `onkeyup` is straightforward, you will extract the data from the target element from the event and get the label you should update — the broadcast will remain the same as before.

{% highlight javascript %}
onkeyup: function(event, element, elementType) {
  var direction = elementType.split('-input')[0],
      value = event.originalEvent.target.value;

  context.broadcast('memetextchanged', {
    value: value,
    direction: direction
  });
}
{% endhighlight %}

Excellent! When you type you should see the overlay text labels get updated whenever a key is pressed in one of the input fields.

## Exercise

That was fun, right? Now it's your turn! Let's synthesize all the concepts you learned in the T3 framework and do some magic.

The exercise is to update the meme's image when one of the thumbnails are clicked. You can check out which the images that are available in the `img/full/` directory. This should encompass creating a new message that is broadcasted and event handling.
