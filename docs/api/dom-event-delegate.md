---
layout: documentation
title: API - DOMEventDelegate
permalink: /docs/api/dom-event-delegate/
---

# DOMEventDelegate

The object type that handles events for modules and behaviors. Exposed publicly to allow developers to use in their own code. To create a new instance, specify the DOM element to handle events for and an object containing event handlers (`onclick`, `onmousedown`, etc., the same as for modules and behaviors):

{% highlight javascript %}
var delegate = new Box.DOMEventDelegate(element, {
	onclick: function(event) {
		console.log(event.type);
	}
});
{% endhighlight %}


<div class="anchor" id="attachEvents"></div>
## attachEvents
### Description
Attaches all events for the delegate.

### Example
{% highlight javascript %}
var delegate = new Box.DOMEventDelegate(element, {
	onclick: function(event) {
		console.log(event.type);
	}
});

delegate.attachEvents();
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="detachEvents"></div>

## detachEvents
### Description
Detaches all events for the delegate.

### Example
{% highlight javascript %}
var delegate = new Box.DOMEventDelegate(element, {
	onclick: function(event) {
		console.log(event.type);
	}
});

delegate.detachEvents();
{% endhighlight %}

