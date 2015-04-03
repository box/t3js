---
layout: default
title: T3 JavaScript Framework
overviewpage: true
---

<div id="core-philosophy" class="margin-bot-100 pad-bot-100 border-bot">
    <div class="row">
        <div class="medium-12 columns text-center">
        	<h1>Core Philosophy</h1>
        </div>
    </div>

    <div class="row pad-top-50">
        <div class="medium-4 columns text-center">
        	<img class="pad-top-25" width="250" height="120" data-interchange="[{{ site.baseurl }}/img/feature-modular.png, (default)], [{{ site.baseurl }}/img/feature-modular@2x.png, (retina)]">
            <noscript><img class="pad-top-25" width="250" height="120" src="{{ site.baseurl }}/img/feature-modular.png" /></noscript>
            <h4 class="margin-top-50 font-force-dark">Modular Design</h4>
            <p class="font-force-gray">T3’s modular approach to applications allows you to focus on building small pieces of functionality.</p>
        </div>
        <div class="medium-4 columns text-center">
        	<img class="pad-top-25" width="250" height="120" data-interchange="[{{ site.baseurl }}/img/feature-collaboration.png, (default)], [{{ site.baseurl }}/img/feature-collaboration@2x.png, (retina)]">
            <noscript><img class="pad-top-25" width="250" height="120" src="{{ site.baseurl }}/img/feature-collaboration.png" /></noscript>
            <h4 class="margin-top-50 font-force-dark">Made for Collaboration</h4>
            <p class="font-force-gray">T3 components can be developed and tested independently , making it perfect for large, distributed teams.</p>
        </div>
        <div class="medium-4 columns text-center">
        	<img class="pad-top-25" width="250" height="120" data-interchange="[{{ site.baseurl }}/img/feature-best-practice.png, (default)], [{{ site.baseurl }}/img/feature-best-practice@2x.png, (retina)]">
            <noscript><img class="pad-top-25" width="250" height="120" src="{{ site.baseurl }}/img/feature-best-practice.png" /></noscript>
            <h4 class="margin-top-50 font-force-dark">Promotes Best Practices</h4>
            <p class="font-force-gray">One of T3’s core goals is to prevent mistakes before they happen, by making it difficult for developers to do the wrong thing.</p>
        </div>
    </div>
</div>

<div id="design-overview" class="margin-bot-100 pad-bot-100 border-bot">
    <div class="row">
        <div class="medium-6 columns">
            <h1>Design Overview</h1>
            <p class="font-force-gray margin-top-25">T3 is different than most JavaScript frameworks. It's meant to be a small piece of an overall architecture that allows you to build scalable client-side code. A T3 application is managed by the <code>Application</code> object, whose primary job is to manage modules, services, and behaviors. It's the combination of these three types of objects that allow you to build a scalable JavaScript front-end.</p>
            <p>T3's design enforces best practices such as loose coupling by limiting how certain components can communicate with each other. Modules cannot interact directly with other modules but may communicate with them through an event bus. Modules may use services directly, but may only reference behaviors in a declarative way. These restrictions ensure that the various pieces remain loosely-coupled to make dependency management easy and maintenance self-contained.</p>
            <p>The loosely-coupled nature of T3 components means that creating tests is easy. Dependencies are injected into each component, making it trivial to substitute a mock object in place of real ones.</p>
        </div>
        <div class="medium-6 columns text-center">
            <h4 class="margin-top-25 font-force-dark">Component Communication</h4>
            <img class="pad-top-50" width="398" height="537" data-interchange="[{{ site.baseurl }}/img/design-diagram.png, (default)], [{{ site.baseurl }}/img/design-diagram@2x.png, (retina)]">
            <noscript><img class="pad-top-25" width="398" height="537" src="{{ site.baseurl }}/img/design-diagram.png" /></noscript>
        </div>
    </div>
</div>

<div id="final-cta" class="margin-bot-100">
    <div class="row">
        <div class="medium-10 medium-offset-1 columns text-center margin-top-25">
            <h2 class="grad-text">Ready to Get Started?</h2>
            <a class="button cta margin-top-25" href="{{ site.baseurl }}/download">Download T3</a>
        </div>
    </div>
</div>
