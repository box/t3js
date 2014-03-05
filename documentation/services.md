---
layout: documentation
title: T3 Javascript Framework - API - Services
permalink: /documentation/services/
---

Services
========
Services are essentially Application extensions that provide new capabilities.
The most important aspect of a service is the interface, it must be well formed
and should adhere to the rules that any standard API does.

Unlike modules, Services can interact directly with the Application layer and may access
lower level libraries such as jQuery and 3rd party plug-ins. In general, modules
should only use services to get work done. Therefore, plugins, such as jQuery UI, should be wrapped
or abstracted out into a T3 service.


General Rules
=============
1. Helper/Testing functions should not be exposed on the service API
1. Unit testing should be done on the interface, not the implementation.
1. Service names should be lower-case, with no underscores or dashes. (e.g. windowpopup)
1. No Application or Business Logic


<div class="anchor" id="Utilities"></div>
Utilities
=========
Utility services add functionality to the Application layer. T3 does not define
any specific implementation details around utilities but does have a few guidelines.

Example Utilities: cookies, ajax, date, strings

Guidelines
----------
1. Utilities should not have a public initialization function (no init or constructor methods)
1. No UI-Specific Logic.
1. Service are created exactly once per page. Make sure not to persist state unintentionally.


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

Export Functions
----------------
A service can optionally export a function onto Application for convenience. This should be
done with care since it does pollute the Application's interface.

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

<div class="anchor" id="Widgets"></div>
Widgets
=======
Widgets are reusable UI-specific pieces of code. They do not contain application logic
and should not contain initialization functions. Widgets are still services though and
these guidelines are here for creating better interfaces. None not restrictions imposed by the framework.


Singleton
---------
Some UI specific components may follow the singleton pattern, especially if one
instance could ever be shown to the user.

Examples: notifications, popups

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

Factory
-------
Factories should have a create() function that return a new instance of a widget object.
The developer can decide what the parameters of create() are. Instantiated objects
can have initialization/constructor logic.

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