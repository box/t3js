---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/initial-setup/
prev: ''
prev_title: Tutorial Introduction
next: create-a-module
next_title: Create a Module
---

# Initial Setup

Alright let's put this scooter in drive! We're going to pack a few things before heading out:

- Your favorite text editor
- A terminal application is handy
- Git and Yeoman are installed

The code we will be walking through is available [here](google.com) on GitHub.

There is a script available at `scripts/bootstrap.sh` that will set up Yeoman and the T3 generator for you. It will need administrator access to install Node and a global Node package (Yeoman). Run `./scripts/bootstrap.sh` from the project root and you should be good to go.

To begin the tutorial, make sure you have Yeoman installed:

```
yo --version
```

See [Yeoman Confluence Page](https://confluence.inside-box.net/display/ETO/Yeoman+Node.js+Generator) for installation instructions.

In addition, make sure that you have the T3 CLI Utility for Yeoman:

```
yo t3
```

## The Application

We will be creating our very own T3 Meme Generator in this exercise. Let's go over what we mean by this before getting our hands dirty. First, a quick snapshot of the finished product:

![Fully built meme generator](http://f.cl.ly/items/161B1L0C2k171Y3B2s3o/Screen%20Shot%202014-02-27%20at%203.26.32%20PM.png)

The functionality we will be implementing in this application is simple, the user will be able to click on a meme they would like to use as background text and using the two input fields that are available they will be able to update the text that is overlayed on the image.

Each step of the way has a corresponding branch that you can fast-forward and rewind to. It's the name of tutorial page you are on in the URL, simply do a `git checkout initial-setup` to get started. Now that everything is in order, let's get down to business.


## Application Directory Structure

Let's take a look at our current directory structure, it currently looks like this:

```
├── css
├── img
│   ├── full
│   └── thumbs
└── js
    ├── behaviors
    ├── modules
    ├── services
    ├── vendor
    │   ├── box
    │   │   └──t3.x.x.js
    │   └── jquery
    │       └──jquery.x.x.js
```

It's a best practice in T3 to have separate directories for modules, services, and behaviors.

See [T3 Yeoman CLI](https://confluence.inside-box.net/display/ETO/Yeoman+T3+CLI+Utility) for installation instructions.
