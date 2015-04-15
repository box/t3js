---
layout: documentation
title: API - Modules
permalink: /docs/api/modules/
---

# Modules
The following methods are optional for you to implement per module.

Modules are only accessible by Application which opens up the possibility of a less strict interface for the module's
definition. For example, if you have complex logic for modules, you may place the function in the public API
for unit testing. This is a completely different methodology than normal and should not be applied to services.

<hr class="separator">

<div class="anchor" id="init"></div>
## init
### Description
Initializes the module. This method is fired automatically by <a href="{{ site.baseurl }}/docs/api/application/#start">Application.start</a>

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('abc', function(context) {
	return {
		init: function() {
			// Outputs "foo"
			console.log('foo');
		}
	};
});

var moduleEl = document.getElementById('mod-test-module');
Application.start(moduleEl);

{% endhighlight %}

<hr class="separator">

<div class="anchor" id="destroy"></div>
## destroy
### Description
Destroys the module. This method is fired automatically by <a href="{{ site.baseurl }}/docs/api/application/#stop">Application.stop</a>

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('abc', function(context) {
	return {
		destroy: function() {
			// Outputs "bar"
			console.log('bar');
		}
	};
});

var moduleEl = document.getElementById('mod-test-module');
Application.start(moduleEl);
Application.stop(moduleEl);

{% endhighlight %}

<hr class="separator">


<div class="anchor" id="messages"></div>
# Message Handling
Messages are part of the built-in T3 pub/sub system for module events. Each module can broadcast information
about events that have happened whlie other modules can subscribe to those messages via the 'onmessage' handler.
As a rule of thumb, message names should be describe what event has taken place and not be used as a RPC call
to other modules. A good name for a message would be 'keywordchanged' which aptly names what specific event
has occurred. A bad message name would be 'updateheader' since it implies what action to be taken as a result
of an event. Modules are isolated and should never be aware of other modules on the page!

## messages
### Description
List of messages that this module will listen for. This is used by Application to fire onmessage handlers.
You should place this at the top of the module API so it is easy to find.

### Example
{% highlight javascript %}
Application.addModule('abc', function(context) {
	return {
		messages: ['statechanged', 'searchcomplete'],
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
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('abc', function(context) {

	return {
		messages: ['statechanged', 'searchcomplete'],
		onmessage: function(name, data) {

			switch (name) {

				case 'statechanged':
					console.log('Navigating somewhere!');
					break;

				case 'searchcomplete':
					console.log('Found ' + data.numResults + ' results.');
					break;

			}
		}
	};

});

// Triggers output of "Navigating somewhere!"
Application.broadcast('statechanged');

// Triggers output of "Found 100 results."
Application.broadcast('searchcomplete', {
	numResults: 100
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="event-handlers"></div>
# Event Handlers
### Description
Handles specific DOM events that are fired within the module. These handlers follow the on<event> convention.
For example, 'onclick' handles click events and 'oncontextmenu' handles right click.

List of handled events:

{% include event-types.html %}

Note: blur/focus events are very flaky and are not supported by Application. For special events, you should define
regular JavaScript event handlers in init() and remove them in destroy()


The handler function should delegate complex logic to other functions. As a rule of thumb, try NOT to pass
the event object around.

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
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	<button data-type="okay-btn">Okay</button>
	<button data-type="cancel-btn">Cancel</button>
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('abc', function(context) {

	return {
		onclick: function(event, element, elementType) {

			switch (elementType) {

				case 'okay-btn':
					console.log('OK!');
					break;

				case 'cancel-btn':
					console.log('NO!');
					break;

			}
		}
	};

});
{% endhighlight %}


# Behaviors
### Description
Behaviors work in parallel with modules. They are intended to be drop-in functionality that needs little additional
interaction with the module. For example, a tabbed UI view where the UI logic is not necessarily important to the
module.
