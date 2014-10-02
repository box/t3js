---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/architecture/
prev: initial-setup
prev_title: Initial Setup
next: initial-setup
next_title: Initial Setup
---

# Architecture

Before diving into the framework, we will discuss the components you will be using from T3. You will be using two modules and a service for the meme generator.

## Breaking Down the Application

To create the application, you need to figure out what the various pieces are. First you need to break down the components on the user interface, these are the *modules* in your application. Next, think about the functionality that will be re-used across the application. Grouping together similar functionality comprises the *services* in your application.

The meme generator application is composed of two modules and a service. One module is responsible for the meme UI and the other is responsible for the user input controls. The service is going to implement image fetching functionality that will populate file URIs for the memes.

The module composition is overlayed below:

![meme-by-modules]({{ site.baseurl }}/img/tutorial-annotated.png)

Now that you know what you're going to build, it's time to start writing some T3.
