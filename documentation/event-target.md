---
layout: documentation
title: T3 Javascript Framework - API - Event Target
permalink: /documentation/event-target/
---

Event Target
------------
Definition of a custom event type. This is used as a utility throughout the framework whenever custom events are used.
It is intended to be inherited from, either through the prototype or via mixin.

Message names should be all lower-case with no dashes or underscores, however, it is not enforced.

<hr class="separator">

<div class="anchor" id="on"></div>
on
--
### Description
Adds a new event handler for a particular type of event.

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
			<td class="required">type</td>
			<td>string</td>
			<td>The name of the event to listen for.</td>
		</tr>
		<tr>
			<td class="required">handler</td>
			<td>Function</td>
			<td>The function to call when the event occurs.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
function customEventHandler(event) {
	console.log('test');
});

EventTarget.on('custom-event', customEventHandler);

EventTarget.fire('custom-event'); // Triggers an output of "test"
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="off"></div>
off
---
### Description
Removes an event handler from a given event.

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
			<td class="required">type</td>
			<td>string</td>
			<td>The name of the event to remove from.</td>
		</tr>
		<tr>
			<td class="required">handler</td>
			<td>Function</td>
			<td>The function to remove as a handler.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
function customEventHandler(event) {
	console.log('test');
});

EventTarget.on('custom-event', customEventHandler);
EventTarget.off('custom-event', customEventHandler);

EventTarget.fire('custom-event'); // Triggers nothing


{% endhighlight %}

<hr class="separator">

<div class="anchor" id="fire"></div>
fire
----
### Description
Fires an event with the given name and data.

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
			<td class="required">type</td>
			<td>string</td>
			<td>The type of event to fire.</td>
		</tr>
		<tr>
			<td class="optional">data</td>
			<td>Function</td>
			<td>An object with properties that should end up on the event object for the given event.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
function searchCompleteHandler(event, data) {
	console.log('Found ' + data.numResults + ' results.');
});

EventTarget.on('searchcomplete', searchCompleteHandler);

// Triggers an output of "Found 100 results."
EventTarget.fire('searchcomplete', {
	numResults: 100
});

{% endhighlight %}
