---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/architecture/
prev: initial-setup
prev_title: Initial Setup
next: create-the-modules
next_title: Create the Modules
---

# Architecture

Before diving into the framework, let's quickly discuss the components you will be using from T3. You will be using two modules and a service for the meme generator.

## Modules

Modules are T3 components that tie user events and application management to an HTML element. A module is represented as a distinct part of the page.

You will be splitting up the meme generator into two different modules, one that handles user events for the text inputs and thumbnail selection and one that updates the meme image and text labels. Below is what our two modules will look like on the page.

![meme-by-modules](http://f.cl.ly/items/0M440q0j1g2e2f2N2c39/Screen%20Shot%202014-02-27%20at%203.26.32%20PM.png)

## Services

Services are components that provide reusable functionality across modules, they come in two flavors:

- **Widgets**: services that provide reusable UI
- **Utilities**: services with no UI, just a grab bag of functions to be used

You will be using a service to build an image fetcher that gets the file URI for meme images. It will be functionality available in multiple modules.

Now that you know what you're going to build, let's get to it.
