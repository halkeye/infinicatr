/* eslint-env serviceworker */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('infinicatr-v1').then(function(cache) {
      return cache.addAll(['/', '/index.html']);
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestURL = new URL(event.request.url);
  if (!requestURL.host.includes("flickr.com")) {
    return event.respondWith(fetch(event.request));
  }

  if (requestURL.pathname.includes("/services/rest/")) {
    return event.respondWith(
      fetch(event.request)
      .then(function(response) {
        return caches.open('infinicatr-v1').then(function(cache) {
          const clonedResponse = response.clone();
          cache.put(event.request, response);
          // cache all the images but return the original request
          return clonedResponse.json().then(function(json) {
            if ('photos' in json && 'photo' in json.photos) {
              cache.addAll(json.photos.photo.map(function(photo) { return photo.url_z; }));
            }
            var options = {
              status: 200,
              headers: new Headers({ 'content-type': 'application/json' })
            };
            return new Response(JSON.stringify(json), options);
          })
        });
      })
      .catch(function() {
        return caches.match(event.request);
      })
    );
  } else {
    return event.respondWith(
      fetch(event.request)
      .then(function(response) {
        return caches.open('infinicatr-v1').then(function(cache) {
          const clonedResponse = response.clone();
          cache.put(event.request, response);
          return clonedResponse;
        });
      })
      .catch(function() {
        return caches.match(event.request);
      })
    );
  }
});
