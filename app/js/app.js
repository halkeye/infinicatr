'use strict';

require('loaders.css/loaders.css');
require('../css/style.scss');
require.context('../icons', true, /icon-.*.png/);

const URLSearchParams = require('url-search-params');
const assign = require('object-assign');
require('isomorphic-fetch');
const Mousetrap = require('mousetrap');
const footerTemplate = require('templates/footer_template.mustache');

const config = {};
config.flickr_key = '850775ffc1d6d95478d78bee0fdf4971';
config.pending_message = 'Please wait. Fetching more content';
config.page_size = 10;
config.pending_photos_threshold = Math.floor(config.page_size * 1 / 3);
config.max_photos = config.page_size * 3;
config.is_chrome_app = window.chrome && window.chrome.permissions;
config.flip_time = 3000;

function hide (el) {
  el.style.display = 'none';
}

function show (el) {
  el.style.display = '';
}

function matches (el, selector) {
  return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
}

function toggleClass (el, className) {
  if (el.classList) {
    el.classList.toggle(className);
  } else {
    var classes = el.className.split(' ');
    var existingIndex = classes.indexOf(className);

    if (existingIndex >= 0) {
      classes.splice(existingIndex, 1);
    } else {
      classes.push(className);
    }

    el.className = classes.join(' ');
  }
}

const pendingElm = document.getElementById('loading_flickr_indicator');
hide(pendingElm);

if ('serviceWorker' in navigator) {
  const SW = require('!!file-loader?name=sw.js!./service-worker.js'); //eslint-disable-line
  navigator.serviceWorker.register(SW)
    .then(registration => {
    console.log('registration successful', registration); //eslint-disable-line
    }).catch(err => {
    console.log('registration failed', err); //eslint-disable-line
    });
}

class Infinicatr {
  constructor () {
    this.page = 1;
    this.timeout = 0;
    this.pendingMorePhotos = null;
    this.photos = [];
  }

  _doFlickrRequest (data) {
    show(pendingElm);
    let url = new URL('https://api.flickr.com/services/rest/');
    let params = assign({}, data, {
      'api_key': config.flickr_key,
      'format': 'json',
      'nojsoncallback': 1
    });
    var searchParams = new URLSearchParams('');

    Object.keys(params).forEach(key => searchParams.append(key, params[key]));
    url.search = searchParams.toString();

    return fetch(url)
      .then(response => response.json())
      .then(response => { hide(pendingElm); return response; });
  }

  getLicenses () {
    return this._doFlickrRequest({
      'method': 'flickr.photos.licenses.getInfo'
    }).then((licenses) => {
      this.licenses = {};
      licenses.licenses.license.forEach((license) => {
        this.licenses[license.id] = license;
      });
    });
  }

  changePhoto () {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = 0;

    const flipper = document.getElementById('flipper');
    const side = matches(flipper, '.flipped') ? document.getElementById('front') : document.getElementById('back');
    const photo = this.photos.pop();
    if (this.photos.length <= config.pending_photos_threshold) {
      this.getMorePhotos();
    }
    if (!photo) { return; }

    this.loadImage(photo.url_z).then((uri) => {
      side.style.backgroundImage = 'url(' + uri + ')';
      toggleClass(flipper, 'flipped');
      this.timeout = setTimeout(this.changePhoto.bind(this), config.flip_time);
      const license = this.licenses[photo.license];
      document.getElementsByTagName('footer')[0].innerHTML = footerTemplate({
        photo_link: 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id,
        title: photo.title,
        author: photo.ownername,
        author_link: 'https://www.flickr.com/people/' + photo.owner,
        license_url: license.url,
        license_name: license.name
      });
    }).catch(() => {
      this.changePhoto();
    });
  }

  getMorePhotos () {
    const onFinish = () => { this.pendingMorePhotos = null; };

    if (this.pendingMorePhotos) { return this.pendingMorePhotos; }
    /* Fetching photos! PLEASE WAIT! */
    this.pendingMorePhotos = this._doFlickrRequest({
      'content_type': '1', // 1 = photos only
      'extras': ['owner_name', 'license', 'url_z', 'media'].join(','),
      'format': 'json',
      'method': 'flickr.photos.search',
      'media': 'photos',
      'page': this.page,
      'per_page': config.page_size,
      'safe_search': '1', // 1 = safe search
      'tags': 'cats'
    })
      .then((data) => {
        data.photos.photo.forEach((photo) => {
          if (!photo.url_z) { return; }
          this.photos.push(photo);
        });
        this.page++;
      })
      .then(onFinish, onFinish);
    return this.pendingMorePhotos;
  }

  loadImage (uri) {
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
        xhr.open('GET', uri, true);
        xhr.responseType = 'blob';
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
app.getLicenses()
  .then(app.getMorePhotos.bind(app))
  .then(app.changePhoto.bind(app));

Mousetrap.bind('right', app.changePhoto.bind(app));
Mousetrap.bind('space', app.changePhoto.bind(app));
