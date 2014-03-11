---
layout: documentation
title: T3 JavaScript Framework - API - Context
permalink: /docs/api/context/
---

# Context
The object type that modules use to interact with the environment.
Used exclusively within Application, but exposed publicly for easy testing.

<div class="anchor" id="getElement"></div>
## getElement
### Description
Returns the element that represents the module.

### Returns
An HTMLElement object.

### Example
{% highlight javascript %}
Application.addModule('abc', function(context) {
	return {
		init: function() {
			// outputs HTMLElement with id 'mod-test-module'
			console.log(context.getElement());
		}
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="getConfig"></div>
## getConfig
### Description
Retrieves a module's configuration data from embedded JSON in a 'text/x-config' script tag.
This method is a proxy to <a href="../application/#getModuleConfig">Application.getModuleConfig</a> but with a shorter name.

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
			<td class="required">element</td>
			<td>HTMLElement</td>
			<td>Module root element.</td>
		</tr>
		<tr>
			<td class="optional">name</td>
			<td>string</td>
			<td>Specific configuration value to retrieve.</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight html %}
<div id="mod-test-module" class="module" data-module="test-module">
	<script type="text/x-config">{"foo": "bar"}</script>
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('abc', function(context) {
	return {
		init: function() {
			// Outputs "bar"
			console.log(context.getConfig('foo'));
		}
	};
});
{% endhighlight %}

<hr class="separator">

# Proxy Methods

<hr class="separator">

<div class="anchor" id="broadcast"></div>
## broadcast

### Description
Broadcasts a message to all registered listeners. A proxy to <a href="../application/#broadcast">Application.broadcast</a>

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
			<td>Name of the message</td>
		</tr>
		<tr>
			<td class="optional">data</td>
			<td>any</td>
			<td>Custom parameters for the message</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight html %}
<div id="mod-search-bar" class="module" data-module="search-bar">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Application.addModule('search-bar', function(context) {
	return {
		search: function() {
			context.broadcast('searchcomplete', {
				numResults: 100
			});
		}
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="getService"></div>
## getService

### Description
Retrieves an instance of a registered service.
A proxy to <a href="../application/#getService">Application.getService</a>

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
			<td class="required">service</td>
			<td>string</td>
			<td>Name of service.</td>
		</tr>
	</tbody>
</table>

### Returns
T3 Service or null.

### Example
{% highlight javascript %}
Application.addModule('abc', function(context) {
	var dom;

	return {
		init: function() {
			dom = context.getService('dom');
		}
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="getGlobalConfig"></div>
## getGlobalConfig

### Description
Retrieves a configuration value that was passed through init.
A proxy to  <a href="../application/#getGlobalConfig">Application.getGlobalConfig</a>

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
			<td class="required">key</td>
			<td>string</td>
			<td>Config key.</td>
		</tr>
	</tbody>
</table>

### Returns
Object.

### Example
{% highlight javascript %}
Application.init({
	username: 'bob'
});

Application.addModule('abc', function(context) {
	return {
		init: function() {
			// Outputs "bob"
			console.log(context.getGlobalConfig('username'));
		}
	};
});
{% endhighlight %}
