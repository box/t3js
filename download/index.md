---
layout: default
title: T3 JavaScript Framework - Download & View Source
downloadpage: true
latestversion: 0.3.0
---


<div class="row">
	<div class="medium-10 medium-offset-1 columns text-center margin-top-100">
	    <h2 class="grad-text">Download T3</h2>
	    <p>Take a look at the source on <a href="https://gitenterprise.inside-box.net/Box/T3">Github</a>, or download to dive right in.</p>
	</div>
</div>
<div class="row">
	<div class="medium-6 columns text-center margin-top-25 margin-bot-50">
		<a id="download-dev" class="cta button margin-top-25" href="{{ site.baseurl }}/js/archive/t3-{{ page.latestversion }}.js">Development Version</a>
	    <p class="font-force-gray">(27.05 KB, with comments)</p>
	</div>
	<div class="medium-6 columns text-center margin-top-25 margin-bot-50">
		<a id="download-prod" class="cta button margin-top-25" style="width: 316px" href="{{ site.baseurl }}/js/archive/t3-{{ page.latestversion }}.min.js">Production Version</a>
	    <p class="font-force-gray">(2.69 KB, min &amp; gzip)</p>
	</div>
</div>

------------

<div class="row">
	<div class="medium-10 medium-offset-1 columns text-center margin-top-50 margin-bot-50">
	    <h2 class="grad-text">Installation</h2>
	</div>
</div>

{% highlight html %}
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path/to/t3.x.x.x.js"></script>
{% endhighlight %}

Create an app.js file and place it at the bottom of your page. Add the following code to app.js:

{% highlight javascript %}
Box.Application.init();
{% endhighlight %}

Add some modules to the page and your app is good to go!
