---
layout: tutorial
title: T3 JavaScript Framework - Tutorials
permalink: /tutorials/use-a-service/
prev: event-handlers
prev_title: Event Handlers
---

# Use a Service

You've covered a lot of ground, you can make modules that can communicate with each other as you'll as the user. Since modules exist completely encapsulated on the page, one of the pains is code reuse between the module files. Don't worry, T3 has got this covered. In T3 you can pack bundles of functions together in *services*, these services can be injected through the `context.getService()` method.

You really can't have just these 3 memes be all you can provide to your users, the range of human emotion is more vast than this. You should be able to fetch meme images from the server as you'll as the handy images you have stored locally in the application. For this you will create a service that is responsible for fetching remote and local meme images.

## Creating a Service

The creation of a service is the same as the creation of a module, you can use the provided `template/service.js` file as a scaffold for your new service. Name this one `meme-fetcher`. This should look pretty similar to modules, you return the public interface and register a name for the returned object.

First, define the public API for this service, you want users of the service to be able to get the available meme images and the service abstracts the returned collection (whether it is remote or local). Name the method `fetchMemes()` that will return an object mapping meme name to an image URI and `fetchMemesByName()` that will get a specific image URI. For the purpose of this exercise you will stub out the remote/local nature of the images.

{% highlight javascript %}
Box.Application.addService('meme-fetcher', function() {
  'use strict';

  var LOCAL_IMAGE_PATHS = {
    '10-guy': 'img/full/10-guy.jpg',
    'bad-time': 'img/full/bad-time.jpg',
    'not-sure-fry': 'img/full/not-sure-fry.jpg'
  };

  function localFetch() {
    return LOCAL_IMAGE_PATHS;
  }

  function serverFetch() {
    // AJAX off and grab the images
  }

  return {
    fetchMemes: function() {
      var offline = true; // omg you're offline

      if (offline) {
        return localFetch();
      } else {
        return serverFetch();
      }
    },

    fetchMemeByName: function(name) {
      return this.fetchMemes()[name];
    }
  };
});
{% endhighlight %}

You will be able to call `context.getService('meme-fetcher')` from within the module to make use of the available functions. This type of code reuse and abstraction is critical in building modules that are clean and have one responsibility (handle user/inter-module communication).

In the last exercise, you added functionality to update the image source URI when a thumbnail was clicked, there was a point where the image was clicked and either the image URI or the meme name had to be broadcasted. Find where in your implementation the construction of the URI happens and exchange that for using the service instead.

{% highlight javascript %}
Box.Application.addModule('meme-generator', function(context) {

  var imageEl;

  ...

  init: function() {

      ...

      imageEl = document.querySelector('.meme-image');
  }

  onmessage: function(name, data) {
      switch(name) {

        ...

        case 'thumbnailclicked':
          var memeFetcher = context.getService('meme-fetcher'),
              srcPath  = memeFetcher.fetchMemeByName(data.memeName);
          imageEl.src = srcPath;
          break;
        // no default
      }
    }
  };

});
{% endhighlight %}
