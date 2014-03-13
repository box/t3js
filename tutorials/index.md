---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/
next: architecture
next_title: Architecture
---

# Tutorial Overview

Welcome! In this tutorial you will get an overview of the T3 JavaScript framework. You should be comfortable with technologies on the web (HTML/CSS/JS). If you ever have a question related to T3 functionality you can always pull up another tab with the handy documentation we have available [here]({{ site.baseurl }}/docs).

## The Application

First, let's talk about what you will be building. You will be creating your very own Meme Generator in this exercise. Here's a screenshot of what the finished application will look like:

![Fully built meme generator](http://f.cl.ly/items/161B1L0C2k171Y3B2s3o/Screen%20Shot%202014-02-27%20at%203.26.32%20PM.png)

The application will provide the user the ability to change the text overlayed on the image and to choose the background image (the meme) that will be used from a list of available thumbnails.

There are two features that you will implement:

- Input controls to manipulate the overlayed text on the image
- A list of thumbnails that can click and update the background meme image

The typical user flow for the application will be to choose a meme and type in some text for the header and footer. With this application in mind, let's talk about the components you will build.
