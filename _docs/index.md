---
layout: documentation
title: Welcome
next_section: installation
permalink: /docs/home/
---

T3 is a client-side JavaScript framework for building large-scale web applications. It's design is based on the principles of [Scalable JavaScript Application Architecture](https://www.youtube.com/watch?v=mKouqShWI4o), specifically:

* Enforcing loose coupling between components
* Making dependencies explicit
* Providing extension points to allow for unforeseen requirements
* Abstracting away common pain points
* Encouraging progressive enhancement

The approaches taken in T3 have been battle-hardened through continuous production use at [Box](https://box.com) since 2013, where we use T3 along with jQuery, jQuery UI, and several other third-party libraries and frameworks.

## Framework Design

T3 is different than most JavaScript frameworks. It's meant to be a small piece of an overall architecture that allows you to build scalable client-side code.

### No MVC Here

T3 is explicitly *not* an MVC framework. It's a framework that allows the creation of loosely-coupled components while letting you decide what other pieces you need for your web application. You can use T3 with other frameworks like [Backbone](http://backbonejs.org/) or [React](http://facebook.github.io/react/), or you can use T3 by itself. If you decide you want models and views, in whatever form, you can still use them with T3.

### Unopinionated by Design

T3 is made to be unopinionated while prescribing how some problems might be solved.  Our goal here is not to create a single framework that can do everything for you, but rather, to provide some structure to your client-side code that allows you to make good choices. Then, you can add in other libraries and frameworks to suit your needs.

### Three Component Types

T3 allows you to define functionality using just three component types:

1. **Services** are utility libraries that provide additional capabilities to your application. You can think of services as tools in a toolbox that you use to build an application. They intended to be reusable pieces of code such as cookie parsing, Ajax communication, string utilities, and so on.
2. **Modules** represent a particular DOM element on a page and manage the interaction inside of that element. It's a module's job to respond to user interaction within its boundaries. Your application is made up of a series of modules. Modules may not interact directly with other modules, but may do so indirectly.
3. **Behaviors** are mixins for modules and are used primarily to allow shared declarative event handling for modules without duplicating code. If, for instance, you use a particular attribute to indicate a link should use Ajax navigation instead of full-page navigation, you can share that functionality amongst multiple modules.

We've found that by using a combination of these three component types, we're able to create compelling, progressively-enhanced user experiences.
