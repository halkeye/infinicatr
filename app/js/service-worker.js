import { manifest, version } from "@parcel/service-worker";

async function install() {
  const cache = await caches.open(version);
  await cache.addAll(manifest);
}
addEventListener("install", (e) => e.waitUntil(install()));

async function activate() {
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => key !== version && caches.delete(key)));
}
addEventListener("activate", (e) => e.waitUntil(activate()));

self.addEventListener("fetch", function (event) {
  const requestURL = new URL(event.request.url);
  if (!(requestURL.protocol in ["http:", "https:"])) {
    return fetch(event.request);
  }

  if (
    requestURL.host.includes("flickr.com") &&
    requestURL.pathname.includes("/services/rest/")
  ) {
    /* if flickr and rest apis, then hit network, then process && cache, but on failure, read from cache */
    return event.respondWith(
      fetch(event.request)
        .then(function (response) {
          return caches.open("infinicatr-v1").then(function (cache) {
            const clonedResponse = response.clone();
            cache.put(event.request, response);
            // cache all the images but return the original request
            return clonedResponse.json().then(function (json) {
              if ("photos" in json && "photo" in json.photos) {
                cache.addAll(
                  json.photos.photo
                    .map(function (photo) {
                      return photo.url_z;
                    })
                    .filter(function (photo) {
                      return photo;
                    }),
                );
              }
              const options = {
                status: 200,
                headers: new Headers({ "content-type": "application/json" }),
              };
              return new Response(JSON.stringify(json), options);
            });
          });
        })
        .catch(function () {
          return caches.match(event.request);
        }),
    );
  } else {
    /* Otherwise, hit network, on failure, load from cache */
    return event.respondWith(
      fetch(event.request)
        .then(function (response) {
          return caches.open("infinicatr-v1").then(function (cache) {
            const clonedResponse = response.clone();
            cache.put(event.request, response);
            return clonedResponse;
          });
        })
        .catch(function () {
          return caches.match(event.request);
        }),
    );
  }
});
