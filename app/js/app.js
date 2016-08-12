'use strict';

require('../../node_modules/loaders.css/loaders.css');
require('../css/style.scss');
require.context('../icons', true, /icon-.*.png/);
require('../manifest.webapp');
require('../manifest.json');
require('file?name=favicon.ico!../favicon.ico');

const URLSearchParams = require('url-search-params');
const assign = require('object-assign');
require('es6-promise').polyfill();
require('isomorphic-fetch');
const Promise = require('bluebird');
const Mousetrap = require('mousetrap');
const $ = require('jquery');

const config = {};
config.flickr_key = '850775ffc1d6d95478d78bee0fdf4971';
config.pending_message = 'Please wait. Fetching more content';
config.page_size = 10;
config.pending_photos_threshold = Math.floor(config.page_size * 1 / 3);
config.max_photos = config.page_size * 3;
config.is_chrome_app = window.chrome && window.chrome.permissions;
config.flip_time = 3000;

const $pending = $('#loading_flickr_indicator').hide();

if ('serviceWorker' in navigator) {
  const SW = require('!!worker?service!./service-worker.js');
  SW().then((registration) => {
    console.log('registration successful', registration); //eslint-disable-line
  }).catch((err) => {
    console.log('registration failed', err); //eslint-disable-line
  });
}

$(window).on('resize', function () {
  const dimension = Math.min($('.main').height(), $('.main').width());
  $('.flipper').css({
    height: dimension,
    width: dimension
  });
}).trigger('resize');

class Infinicatr {
  constructor () {
    this.page = 1;
    this.timeout = 0;
    this.pendingMorePhotos = null;
    this.photos = [];
  }

  _doFlickrRequest (data) {
    $pending.show();
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
      .then(response => { $pending.hide(); return response; });
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

    const flipper = $('.flipper');
    const side = flipper.is('.flipped') ? $('.front') : $('.back');
    const photo = this.photos.pop();
    if (this.photos.length <= config.pending_photos_threshold) {
      this.getMorePhotos();
    }
    if (!photo) { return; }

    this.loadImage(photo.url_z).then((uri) => {
      side.css('background-image', 'url(' + uri + ')');
      flipper.toggleClass('flipped');
      this.timeout = setTimeout(this.changePhoto.bind(this), config.flip_time);
      $('footer .photo_title')
        .attr('href', 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id)
        .text(photo.title);
      $('footer .photo_author')
        .attr('href', 'https://www.flickr.com/people/' + photo.owner)
        .text(photo.ownername);
      const license = this.licenses[photo.license];
      $('footer .photo_license').attr('href', license.url)
        .text(license.name);
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
              reject();
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
