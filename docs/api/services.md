---
layout: documentation
title: API - Services
permalink: /docs/api/services/
---

<div class="anchor" id="Services"></div>
# Services
Services are Application extensions that provide new capabilities to the entire system.
The most important aspect of a service is its interface. Other modules and services
may depend on it and so the interface must remain stable so as not to unexpectedly break code.

Unlike modules, services can interact directly with the Application layer and may access
lower level libraries such as jQuery and 3rd party plug-ins. In general, modules
should only use services to get work done. Therefore, plugins, such as jQuery UI, should be wrapped
or abstracted by a T3 service.

<div class="anchor" id="Rules"></div>
# Rules
1. Helper/Testing functions should not be exposed on the service API
1. Unit testing should be done on the interface, not the implementation.
1. Service names should be lower-case, with no underscores or dashes. (e.g. windowpopup)
1. No Application/Business Logic

<div class="anchor" id="Classification"></div>
# Classification
Services can be classified into two major categories: Widgets (UI-specific) and Utilities (non-UI).

<div class="anchor" id="Utility"></div>
## Utility
Utility services add functionality to the Application layer. T3 does not define
any specific implementation details around utilities but does have a few guidelines.

Example Utilities: cookies, ajax, date, strings

### Guidelines
1. Utilities should not have a public initialization function (no init or constructor methods)
1. No UI-Specific Logic.
1. Service are created exactly once per page. Any state stored on the service will be shared amongst
all users of the service. Be sure that is what you want.


{% highlight js %}
Application.addService('router', function(application) {
	return {
		route: function(url, state) {
			history.pushState(state, '', url);
		}
	};
});

var router = Application.getService('router');
router.route('/home', {});

{% endhighlight %}

### Export Functions
A service can optionally export a function onto Application for convenience. This should be
done with care since it does pollute the Application's interface. Here is the example above
with an added export option:

{% highlight js %}
Application.addService('router', function(application) {
	return {
		route: function(url, state) {
			history.pushState(state, '', url);
		}
	};
}, {
	exports: ['route']
});

Application.route('/home', {});

{% endhighlight %}

<div class="anchor" id="Widget"></div>
## Widgets
Widgets are reusable UI-specific pieces of code. They do not contain application logic
and should not contain initialization functions. Widgets are still services though and
these guidelines are here for creating better interfaces. None not restrictions imposed by the framework.

Examples: popups, tooltips, menus

{% highlight js %}
Application.addService('popups', function(application) {

	return {
		alert: function(message) { ... },
		confirm: function(message, callback) { ... }
	};

});

var popupsService = Application.getService('popups');
popupsService.alert('Hello World!');
{% endhighlight %}

<div class="anchor" id="Patterns"></div>
# Patterns
There are two major patterns that services should follow. The following guidelines are for convention
purposes and not hard requirements.

<div class="anchor" id="Singleton"></div>
## Singleton
Most utility services follow the singleton pattern.

Examples: dom, cookies, ajax

{% highlight js %}
Application.addService('dom', function(application) {

	return {
		query: function(selector) { ... },
		addClass: function(element, className) { ... }
		removeClassClass: function(element, className) { ... }
	};

});

var dom = Application.getService('dom');

var element = dom.query('#test');
dom.addClass(element, 'style1');
dom.removeClass(element, 'style2');
{% endhighlight %}

<div class="anchor" id="Factory"></div>
## Factory
As a convention, factories should have a `create()` method that returns a new instance of an object.
You can decide what the parameters of `create()` are and unlike singletons, you can have initialization
and constructor logic within these objects.

Example Widgets: tooltips, menus, tabs

{% highlight js %}
Application.addService('tooltips', function(application) {

	function Tooltip(params) {
		this.message = params.message;
	}
	Tooltip.prototype.show = function() {};
	Tooltip.prototype.hide = function() {};

	// Return a factory object with some additional functionality
	return {
		create: function(params) {
			return new Tooltip(params);
		},
		hideAll: function() {
			...
		}
	};

});

var tooltip = Application.getService('tooltips').create({
	message: 'Click Me!'
});
tooltip.show();
{% endhighlight %}

