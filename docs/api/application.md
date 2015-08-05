---
layout: documentation
title: API - Application
permalink: /docs/api/application/
---

# Application
The core application object where components are registered and managed


<div class="anchor" id="init"></div>
## init
### Description
Initializes the application. This will start modules on the page.

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
			<td class="optional">config</td>
			<td>Object</td>
			<td>Used to pass configuration information to services. See <a href="#getGlobalConfig">getGlobalConfig</a>.</td>
		</tr>
		<tr>
			<td class="optional">config.debug</td>
			<td>boolean</td>
			<td>If true, will print exceptions in console. Otherwise, will catch all exceptions and hide them from users.</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight javascript %}
Box.Application.init();
{% endhighlight %}
or
{% highlight javascript %}
Box.Application.init({
	debug: true,
	foo: { ... },
	bar: "baz"
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="destroy"></div>
## destroy
### Description
Destroys the application. This will stop modules on the page and unregister modules, services, and behaviors.

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight javascript %}
Box.Application.destroy();
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="addService"></div>
## addService
### Description
Register a T3 Service component.

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
			<td>Name of service.</td>
		</tr>
		<tr>
			<td class="required">creator</td>
			<td>Function</td>
			<td>Creator function for the service.</td>
		</tr>
		<tr>
			<td class="optional">options</td>
			<td>Object</td>
			<td>Additional options to configure the service.</td>
		</tr>
		<tr>
			<td class="optional">options.exports</td>
			<td>String[]</td>
			<td>List of methods that will be exported onto Box.Application.</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight javascript %}
Box.Application.addService('some-service', function(application) {
	return {
		foo: function() { ... }
	};
});
{% endhighlight %}


{% highlight javascript %}
Box.Application.addService('router', function(application) {
	return {
		route: function() { ... }
	};
}, {
	exports: ['route']
});

Box.Application.route(...);
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="addModule"></div>
## addModule
### Description
Register a T3 Module component.

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
			<td>Name of module.</td>
		</tr>
		<tr>
			<td class="required">creator</td>
			<td>Function</td>
			<td>Creator function for the module.</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight javascript %}
Box.Application.addModule('some-module', function(context) {
	return {
		init: function() { ... },
		destroy: function() { ... }
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="addBehavior"></div>
## addBehavior
### Description
Register a T3 Behavior component.


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
			<td>Name of behavior.</td>
		</tr>
		<tr>
			<td class="required">creator</td>
			<td>Function</td>
			<td>Creator function for the behavior.</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight javascript %}
Box.Application.addBehavior('some-behavior', function(context) {
	return {
		init: function() { ... },
		destroy: function() { ... }
	};
});
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="getService"></div>
## getService
### Description
Retrieves an instance of a registered service.

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

<hr class="separator">

<div class="anchor" id="getGlobal"></div>
## getGlobal
### Description
Returns a global variable. This function exists to make accessing globals more explicit.

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
			<td>Name of global.</td>
		</tr>
	</tbody>
</table>

### Returns
The global variable if it exists or null.


### Example
{% highlight javascript %}
var navigator = Box.Application.getGlobal('navigator');
console.log(navigator.userAgent);
{% endhighlight %}


<hr class="separator">

<div class="anchor" id="getGlobalConfig"></div>
## getGlobalConfig
### Description
Retrieves a configuration value that was passed through init.

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
Box.Application.init({
	username: 'bob'
});

console.log(Box.Application.getGlobalConfig('username')); // Outputs "bob"
{% endhighlight %}


<hr class="separator">

<div class="anchor" id="getModuleConfig"></div>
## getModuleConfig
### Description
Retrieves a module's configuration data from embedded JSON in a 'text/x-config' script tag.
See <a href="../context/#getConfig">Context.getConfig</a>.


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
<div id="mod-test-module" data-module="test-module">
	<script type="text/x-config">{"foo": "bar"}</script>
	...
</div>
{% endhighlight %}

### Returns
Object.

{% highlight javascript %}
var moduleEl = document.getElementById('mod-test-module');

// outputs {"foo": "bar"}
console.log(Box.Application.getModuleConfig(moduleEl));

// outputs "bar"
console.log(Box.Application.getModuleConfig(moduleEl, 'foo'));

// outputs null
console.log(Box.Application.getModuleConfig(moduleEl, 'baz'));
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="start"></div>
## start
### Description
Begins the lifecycle of a module (registers and binds listeners).

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
			<td>DOM element associated with module to be started</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
var moduleEl = document.getElementById('mod-test-module');

Box.Application.start(moduleEl);
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="startAll"></div>
## startAll
### Description
Starts all modules contained within an element.

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
			<td>DOM element which contains modules</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight html %}
<div id="content">
	<div id="mod-test-module" data-module="test-module">
		...
	</div>
	<div id="mod-another-module" data-module="another-module">
		...
	</div>
</div>
{% endhighlight %}

{% highlight javascript %}
var contentEl = document.getElementById('content');

Box.Application.startAll(contentEl); // starts both modules
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="stop"></div>
##stop
### Description
Ends the lifecycle of a module (unregisters and unbinds listeners).

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
			<td>DOM element associated with module to be stopped</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
var moduleEl = document.getElementById('mod-test-module');

Box.Application.stop(moduleEl);
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="stopAll"></div>
## stopAll
### Description
Stops all modules contained within an element.

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
			<td>DOM element which contains modules</td>
		</tr>
	</tbody>
</table>

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight html %}
<div id="content">
	<div id="mod-test-module" data-module="test-module">
		...
	</div>
	<div id="mod-another-module" data-module="another-module">
		...
	</div>
</div>
{% endhighlight %}

{% highlight javascript %}
var contentEl = document.getElementById('content');

Box.Application.stopAll(contentEl); // stop both modules
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="isStarted"></div>
## isStarted
### Description
Determines if a module represented by the HTML element is started.
If the element doesn't have a data-module attribute, this method always returns false.

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
			<td>DOM element which contains modules</td>
		</tr>
	</tbody>
</table>

### Returns
Returns true if module is started. False, otherwise.

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
var moduleEl = document.getElementById('mod-test-module');

console.log(Box.Application.isStarted(moduleEl)); // Returns false

Box.Application.start(moduleEl);

console.log(Box.Application.isStarted(moduleEl)); // Returns true
{% endhighlight %}

<hr class="separator">

<div class="anchor" id="broadcast"></div>
## broadcast
### Description
Broadcasts a message to all registered listeners

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

### Returns
The `Box.Application` object (for chaining purposes).

### Example
{% highlight html %}
<div id="mod-test-module" data-module="test-module">
	...
</div>
{% endhighlight %}

{% highlight javascript %}
Box.Application.broadcast('some-message');
{% endhighlight %}

{% highlight javascript %}
Box.Application.broadcast('statechanged', {
	foo: 'search',
	bar: 'home'
});
{% endhighlight %}

<hr class="separator">

## reportError
### Description
Signals that an error has occurred. If in debug mode, an error is thrown. Otherwise, an event is fired.

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
			<td class="required">exception</td>
			<td>Error</td>
			<td>An error object</td>
		</tr>
	</tbody>
</table>

### Example
{% highlight javascript %}
Box.Application.reportError(new Error('Invalid User ID'));
{% endhighlight %}

<hr class="separator">

## Additional Methods
<div class="anchor" id="on"></div>
### on
See <a href="../event-target/#on">EventTarget.on</a>

<div class="anchor" id="off"></div>
### off
See <a href="../event-target/#off">EventTarget.off</a>

<div class="anchor" id="fire"></div>
### fire
See <a href="../event-target/#fire">EventTarget.fire</a>
