import "whatwg-fetch";
import Mousetrap from "mousetrap";

const config = {};
config.flickr_key = "850775ffc1d6d95478d78bee0fdf4971";
config.pending_message = "Please wait. Fetching more content";
config.page_size = 10;
config.pending_photos_threshold = Math.floor((config.page_size * 1) / 3);
config.max_photos = config.page_size * 3;
config.is_chrome_app = window.chrome && window.chrome.permissions;
config.flip_time = 3000;

function hide(el) {
  el.style.display = "none";
}

function show(el) {
  el.style.display = "";
}

function matches(el, selector) {
  return (
    el.matches ||
    el.matchesSelector ||
    el.msMatchesSelector ||
    el.mozMatchesSelector ||
    el.webkitMatchesSelector ||
    el.oMatchesSelector
  ).call(el, selector);
}

function toggleClass(el, className) {
  el.classList.toggle(className);
}

const pendingElm = document.getElementById("loading_flickr_indicator");
hide(pendingElm);

class Infinicatr {
  constructor() {
    this.page = 1;
    this.timeout = 0;
    this.pendingMorePhotos = null;
    this.photos = [];
  }

  _doFlickrRequest(data) {
    show(pendingElm);
    const url = new URL("https://api.flickr.com/services/rest/");
    const params = Object.assign({}, data, {
      api_key: config.flickr_key,
      format: "json",
      nojsoncallback: 1,
    });
    const searchParams = new URLSearchParams("");

    Object.keys(params).forEach((key) => searchParams.append(key, params[key]));
    url.search = searchParams.toString();

    return window
      .fetch(url)
      .then((response) => response.json())
      .then((response) => {
        hide(pendingElm);
        return response;
      });
  }

  getLicenses() {
    return this._doFlickrRequest({
      method: "flickr.photos.licenses.getInfo",
    }).then((licenses) => {
      this.licenses = {};
      licenses.licenses.license.forEach((license) => {
        this.licenses[license.id] = license;
      });
      return;
    });
  }

  changePhoto() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = 0;

    const flipper = document.getElementById("flipper");
    const side = matches(flipper, ".flipped")
      ? document.getElementById("front")
      : document.getElementById("back");
    const photo = this.photos.pop();
    if (this.photos.length <= config.pending_photos_threshold) {
      this.getMorePhotos();
    }
    if (!photo) {
      return;
    }

    this.loadImage(photo.url_z)
      .then((uri) => {
        side.style.backgroundImage = "url(" + uri + ")";
        toggleClass(flipper, "flipped");
        this.timeout = setTimeout(
          this.changePhoto.bind(this),
          config.flip_time,
        );
        const license = this.licenses[photo.license];
        document.querySelector("footer .photo_title").textContent = photo.title;
        document.querySelector("footer .photo_title").href =
          `https://www.flickr.com/photos/${photo.owner}/${photo.id}`;
        document.querySelector("footer .photo_author").textContent =
          photo.ownername;
        document.querySelector("footer .photo_author").href =
          `https://www.flickr.com/people/${photo.owner}`;
        document.querySelector("footer .photo_license").textContent =
          license.name;
        document.querySelector("footer .photo_license").href = license.url;
        return;
      })
      .catch((e) => {
        console.error("Error changing photo, trying next one", e);
        this.changePhoto();
      });
  }

  getMorePhotos() {
    const onFinish = () => {
      this.pendingMorePhotos = null;
    };

    if (this.pendingMorePhotos) {
      return this.pendingMorePhotos;
    }
    // Fetching photos! PLEASE WAIT!
    this.pendingMorePhotos = this._doFlickrRequest({
      content_type: "1", // 1 = photos only
      extras: ["owner_name", "license", "url_z", "media"].join(","),
      format: "json",
      method: "flickr.photos.search",
      media: "photos",
      page: this.page,
      per_page: config.page_size,
      safe_search: "1", // 1 = safe search
      tags: "cats",
    })
      .then((data) => {
        data.photos.photo.forEach((photo) => {
          if (!photo.url_z) {
            return;
          }
          this.photos.push(photo);
        });
        this.page++;
        return;
      })
      .then(onFinish, onFinish);
    return this.pendingMorePhotos;
  }

  loadImage(uri) {
    return new Promise(function (resolve, reject) {
      if (config.is_chrome_app) {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
          if (this.readyState === 4) {
            if (this.status === 200) {
              const url = window.URL || window.webkitURL;
              resolve(url.createObjectURL(this.response));
            } else {
              reject(new Error());
            }
          }
        };
        xhr.open("GET", uri, true);
        xhr.responseType = "blob";
        xhr.send();
      } else {
        const img = new Image();
        img.src = uri;
        img.onload = () => resolve(uri);
        img.onerror = () => reject(uri);
      }
    });
  }
}

const app = new Infinicatr();
app
  .getLicenses()
  .then(app.getMorePhotos.bind(app))
  .then(app.changePhoto.bind(app))
  .catch(console.error);

Mousetrap.bind("right", app.changePhoto.bind(app));
Mousetrap.bind("space", app.changePhoto.bind(app));

navigator.serviceWorker.register(
  new URL("service-worker.js", import.meta.url),
  { type: "module" },
);
