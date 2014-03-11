---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/initial-setup/
prev: ''
prev_title: Tutorial Introduction
next: create-the-modules
next_title: Create the Modules
---

# Initial Setup

You're going to need a few things in order to complete this tutorial:

- Your favorite text editor
- A terminal application is handy
- Git and Yeoman installed

The code for this tutorial is available [here](https://gitenterprise.inside-box.net/Box/t3-tutorial) on GitHub.

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

You will be creating your very own T3 Meme Generator in this exercise. First, a quick snapshot of the finished product:

![Fully built meme generator](http://f.cl.ly/items/161B1L0C2k171Y3B2s3o/Screen%20Shot%202014-02-27%20at%203.26.32%20PM.png)

The functionality you will be implementing in this application is simple, the user can click on a meme they would like to use as background text. Then, using the two input fields that are available, they can update the text that is overlayed onto the image.

## Get the code

Each step of the way has a corresponding Git branch that you can fast-forward and rewind to. The branch name is the same as the name of the tutorial page URL path. Type the following to get started:

```
git checkout initial-setup
```

This gives you the completed steps for this part of the tutorial.

## Application Directory Structure

Take a look at the directory structure, it currently looks like this:

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
