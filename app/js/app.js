require('../../node_modules/loaders.css/loaders.css');
require('../css/style.scss');
const assign = require('object-assign');

(function () {
  const size = 60;
  /* hack to require them all */
  require('../icons/icon-' + size + '.png');
  require('../manifest.webapp');
  require('../manifest.json');
})();

require('file?name=favicon.ico!../favicon.ico');

const Promise = require('bluebird');
const Mousetrap = require('mousetrap');
const $ = require('jquery');
//require('touchswipe')($);
//window.jQuery = $;

const config = {};
config.flickr_key = '850775ffc1d6d95478d78bee0fdf4971';
config.pending_message = 'Please wait. Fetching more content';
config.page_size = 10;
config.pending_photos_threshold = Math.floor(config.page_size * 1 / 3);
config.max_photos = config.page_size * 3;
config.is_chrome_app = window.chrome && window.chrome.permissions;
config.flip_time = 3000;

const $pending = $('#loading_flickr_indicator').hide();

$(window).on('resize', function () {
  const dimension = Math.min($('.main').height(), $('.main').width());
  $('.flipper').css({
    height: dimension,
    width: dimension
  });
}).trigger('resize');

class Infinicatr {
  constructor() {
    this.page = 1;
    this.timeout = 0;
    this.pendingMorePhotos = null;
    this.photos = [];
  }

  _doFlickrRequest(data) {
    return new Promise(function (resolve, reject) {
      const query = {
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        beforeSend: () => {
          $pending.show();
        },
        data: {
          'api_key': config.flickr_key,
          'format': 'json'
        }
      };
      query.data = assign({}, query.data, data);
      if (config.is_chrome_app) {
        query.dataType = 'json';
        query.jsonp = false;
        query.data.nojsoncallback = 1;
      }
      $.ajax('https://api.flickr.com/services/rest/', query)
        .always(() => {
          $pending.hide();
        })
        .done((jsonData) => {
          resolve(jsonData);
        })
        .fail((response, textStatus) => {
          reject(textStatus);
        });
    });
  }

  getLicenses() {
    return this._doFlickrRequest({
      'method': 'flickr.photos.licenses.getInfo'
    }).then((licenses) => {
      this.licenses = {};
      licenses.licenses.license.forEach((license) => {
        this.licenses[license.id] = license;
      });
    });
  }

  changePhoto() {
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
    }).error(() => {
      this.changePhoto();
    });
  }

  getMorePhotos() {
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
    .finally(() => {
      this.pendingMorePhotos = null;
    });
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
