---
layout: documentation
title: T3 JavaScript Framework - API - Behaviors
permalink: /docs/api/behaviors/
---

# Behaviors
The following methods are optional for you to implement per behavior.

Behaviors are extensions of modules with very similar interfaces.
They add common functionality and event handling to modules but do not actually interact with the original module.
For example, two modules can use an "item" behavior to handle complex click actions but the behavior itself
does not care which module is using it. It does it's own thing and that is it.

<hr class="separator">

<div class="anchor" id="init"></div>
## init
### Description
Initializes the behavior. This method is fired automatically when <a href="{{ site.baseurl }}/docs/api/application/#start">Application.start</a> is called on the related module.

### Example
{% highlight html %}
<div id="mod-test-module" class="module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addBehavior('item-menu', function(context) {
	var menu;

	return {
		init: function() {
			menu = context.getService('menus').create();
			menu.init();
		}
	};
});

Application.addModule('item-list', function(context) {
	return {
		behaviors: ['item-menu']
	};
});

var moduleEl = document.getElementById('mod-test-module');

// Will fire menu.init()
Application.start(moduleEl);

{% endhighlight %}

<hr class="separator">

<div class="anchor" id="destroy"></div>
## destroy
### Description
Destroys the behavior. This method is fired automatically when <a href="{{ site.baseurl }}/docs/api/application/#stop">Application.stop</a> is called on the related module.

### Example
{% highlight html %}
<div id="mod-test-module" class="module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addBehavior('item-menu', function(context) {
	var menu;

	return {
		destroy: function() {
			menu.destroy();
		}
	};
});

Application.addModule('item-list', function(context) {
	return {
		behaviors: ['item-menu']
	};
});

var moduleEl = document.getElementById('mod-test-module');
Application.start(moduleEl);

// Calls menu.destroy();
Application.stop(moduleEl);

{% endhighlight %}

<hr class="separator">

<div class="anchor" id="messages"></div>
# Message Handling
Message handlers for behaviors are the same as <a href="{{ site.baseurl }}/docs/api/modules/#messages">Module.messages</a>. Each one is handled separately and both can execute off the
same message.

## messages
### Description
List of messages that this behavior will listen for. This is used by Application to fire onmessage handlers.
You should place this at the top of the behavior API so it is easy to find.

### Example
{% highlight javascript %}
Application.addBehavior('test-behavior', function(context) {
	return {
		messages: ['some-message'],
		onmessage: ... see below ...
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="onmessage"></div>
## onmessage
### Description
Handles application messages.

This message handler function should be placed above event handlers.

### Usage
<table class="table table-striped">
	<thead>
		<tr>
			<th>Parameter</th>
			<th>Type</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="required">name</td>
			<td>string</td>
			<td>The message name.</td>
		</tr>
		<tr>
			<td class="optional">data</td>
			<td>any</td>
			<td>Related data for the message.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
Application.addBehavior('item', function(context) {

	return {
		messages: ['itemdeleted', 'itemshared'],
		onmessage: function(name, data) {

			switch (name) {

				case 'itemdeleted':
					console.log('Item has been deleted!');
					break;

				case 'itemshared':
					console.log(data.name + ' shared.');
					break;

			}
		}
	};

});

// Triggers output of "Item has been deleted!"
Application.broadcast('itemdeleted');

// Triggers output of "My Pictures shared."
Application.broadcast('itemshared', {
	name: "My Pictures"
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="event-handlers"></div>
# Event Handlers
### Description
Handles specific DOM events that are fired within the module behavior. These handlers follow the on<event> convention.
For example, 'onclick' handles click events and 'oncontextmenu' handles right click.

List of handled events:

{% include event-types.html %}

Note: blur/focus events are very flaky and are not supported by Application. For special events, you should define
regular JavaScript event handlers in init() and remove them in destroy()

The handler function should delegate complex logic to other functions. As a rule of thumb, try NOT to pass
the event object around.

Note: Behavior event handlers are processed after the module event handler. Handlers should not overlap so be careful
of default case handling.

### Usage
<table class="table table-striped">
	<thead>
		<tr>
			<th>Parameter</th>
			<th>Type</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class="required">event</td>
			<td>Event</td>
			<td>A DOM-normalized event object.</td>
		</tr>
		<tr>
			<td class="required">element</td>
			<td>HTMLElement</td>
			<td>The nearest HTML element with a data-type attribute specified or null if there is none.</td>
		</tr>
		<tr>
			<td class="required">elementType</td>
			<td>string</td>
			<td>The value of data-type for the nearest element with that attribute specified or null if there is none.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
Application.addBehavior('item-menu', function(context) {
	var menu;

	return {
		onclick: function(event, element, elementType) {

			switch (elementType) {

				case 'options-btn':
					menu.open();
					break;

				// Behaviors should not have default handling

			}
		}
	};

});
{% endhighlight %}

