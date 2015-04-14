---
layout: documentation
title: Thinking in T3
next: modules
---

# Thinking in T3

To get the most out of T3, it helps to understand some of the thinking behind it and the patterns of usage. At it's core, T3 simply helps to organize your code into different, loosely-coupled components. To review, there are three types of components:

1. **Modules** - represent an area of a web page
2. **Services** - utility libraries that provide additional functionality
3. **Behaviors** - mixins for modules

The combination of these component types is very powerful and allows for the creation of a large number of different interactions.

## Built for Progressive Enhancement

T3 is built on the idea of [progressive enhancement](http://en.wikipedia.org/wiki/Progressive_enhancement), which is to say that JavaScript isn't required for the web page or application to be useful. This is the opposite approach from a lot of other JavaScript frameworks that assume you want to handle all HTML rendering in the client. T3 assumes that the HTML content is already present and simply allows components to interact with that content. We believe that progressive enhancement is a more robust approach for large-scale applications.

## Best Practices Built-in

When building T3, we kept in mind several best practices to help guide our decisions:

1. Explicit is better than implicit.
1. Loose coupling is important.
1. Global variables should be avoided.
1. Errors should be obvious and have useful messages during development.

A lot of the T3 features are best understood by keeping these best practices in mind.

## Loose Coupling of Components

One of the key parts of T3 is ensuring loose coupling of components. When components have implicit coupling, it can cause a lot of problems in a large web application. You end up needing to load files in a particular order for things to work, and it can be hard to know when certain files are no longer needed. You can also end up in a situation where changing one component means a lot of other components can break.

T3 enforces loose-coupling in a number of ways:

1. Modules cannot access other modules directly.
1. Modules cannot access behaviors directly.
1. Behaviors cannot access other behaviors directly.
1. Behaviors cannot access modules directly.
1. No T3 components should access `Box.Application` directly.

Only services can be accessed directly by modules and behaviors, meaning that the interface of services is important and should be changed only when necessary. Otherwise, modules and behaviors are kept strictly separate such that it's easy to add or remove them at any point in time without breaking your application.

## Thinking About Features

Most work on web applications are categorized as features, and most features involve adding something new to a page. When you're thinking about a feature in T3, it's best to think through what combination of components you'll need for a complete implementation.

### Start with Modules

The best place to start is by thinking about modules. Modules represent an area of the page, so if you're adding a new area, it's easy to see that you should add a new module. Each new module should have a specific purpose and should be able to exist on a page completely by itself. It sometimes helps to develop new functionality on a page with just the single module on it. That way, you're quickly able to tell if you have any dependencies on other part of the page.

We recommend that each module cover as large an area of the page as possible. For instance, most application headers contain a large amount of functionality: main navigation, a searchbox, dropdown menus, etc. Whereas other frameworks may require you to represent each of those as a separate component, T3 encourages you to create a single header module and then augment with services or behaviors.

The key thing to keep in mind about modules is that they should be self-contained and only have dependencies on the HTML content, services, and behaviors.

### Move on to Services

Once you've decided on the modules for your feature, the next step is to think about services. Since services are utility libraries designed to be used in multiple places, you should ask yourself a couple of questions about the functionality of your feature:

1. Is there any truly generic functionality (such as cookie parsing or validation)?
1. Can you foresee another module wanting to do something similar?
1. Is there a third-party library that encompasses some of this functionality?

If you answer, "yes," to any of these questions, then there's a good chance you'll want to create a service.

When we were converting the Box web application to T3, we started by converting our various one-off utility objects into services. This allowed us to eliminate global objects while we keeping the same interface.

### Thinking about Behaviors

Behaviors are designed to be the glue between modules and services when you want specific functionality to be triggered based on a user action. As such, behaviors tend to be very small, mostly assigning an event handler to call a service.

New behaviors tend to be created infrequently for individual features but rather are created as part of an overall application toolkit. For example, you may want certain links to use Ajax navigation when clicked instead of using full-page navigation. The recommended way to do this is to create an Ajax navigation service and then create a behavior that listens for click events on links. Then, any module that wants to enable Ajax navigation can simply reference the given behavior.

In general, behaviors are created only after seeing a pattern of modules responding to the same event in the same way. The key to writing a good behavior is to keep it small and delegate responsibilities to one or more services.
