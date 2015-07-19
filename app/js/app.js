'use strict';
require('../../node_modules/loaders.css/loaders.css');
require('../css/style.scss');
var assign = require('object-assign');

(function() {
  let size = 60;
  /* hack to require them all */
  require('../icons/icon-' + size + '.png');
  require('../manifest.webapp');
  require('../manifest.json');
})();

require('file?name=favicon.ico!../favicon.ico');

var Promise = require('bluebird');
var Mousetrap = require('mousetrap');
var $ = require('jquery');
//require('touchswipe')($);
//window.jQuery = $;

var config = {};
config.flickr_key = '850775ffc1d6d95478d78bee0fdf4971';
config.pending_message = 'Please wait. Fetching more content';
config.page_size = 10;
config.pending_photos_threshold = Math.floor(config.page_size * 1 / 3);
config.max_photos = config.page_size * 3;
config.is_chrome_app = window.chrome && window.chrome.permissions;
config.flip_time = 3000;

var $pending = $('#loading_flickr_indicator').hide();

var page = 1;
var pendingMorePhotos = 0;
var photos = [];

$(window).on('resize', function() {
  var dimension = Math.min($('.main').height(), $('.main').width());
  $('.flipper').css({
    height: dimension,
    width: dimension
  });
}).trigger('resize');

class Infinicatr {
  constructor() {
    this.timeout = 0;
  }

  _doFlickrRequest(data) {
    var query = {
      dataType: 'jsonp',
      jsonp: 'jsoncallback',
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
    return new Promise(function(resolve, reject) {
      $.ajax('https://api.flickr.com/services/rest/', query).done((jsonData) => {
        resolve(jsonData);
      }).fail((response, textStatus) => {
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

    var flipper = $('.flipper');
    var side = $('.back');

    if (flipper.is('.flipped')) {
      side = $('.front');
    }

    var photo = photos.pop();
    if (photos.length <= config.pending_photos_threshold) {
      this.getMorePhotos();
    }
    if (!photo) { return; }

    this.loadImage(photo.url_z).then((uri) => {
      side.css('background-image', 'url(' + uri + ')');
      flipper.toggleClass('flipped');
      this.timeout = setTimeout(this.changePhoto.bind(this), config.flip_time);
      $('footer .photo_title').attr('href', 'https://www.flickr.com/photos/' + photo.owner + '/' + photo.id).text(photo.title);
      $('footer .photo_author').attr('href', 'https://www.flickr.com/people/' + photo.owner).text(photo.ownername);
      let license = this.licenses[photo.license];
      $('footer .photo_license').attr('href', license.url).text(license.name);
    }).error(() => {
      this.changePhoto();
    });
  }

  getMorePhotos() {
    return new Promise(function(resolve, reject) {
      if (pendingMorePhotos) { return resolve(); }
      /* Fetching photos! PLEASE WAIT! */
      pendingMorePhotos = 1;
      var query = {
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        beforeSend: function() {
          $pending.show();
        },
        complete: function() {
          pendingMorePhotos = 0;
          $pending.hide();
        },
        error: function() {
          reject();
        },
        success: function(data) {
          data.photos.photo.forEach(function(photo) {
            if (!photo.url_z) { return; }
            photos.push(photo);
          });
          resolve();
        },
        data: {
          'api_key': config.flickr_key,
          'content_type': '1', // 1 = photos only
          'extras': ['owner_name', 'license', 'url_z', 'media'].join(','),
          'format': 'json',
          'method': 'flickr.photos.search',
          'media': 'photos',
          'page': page,
          'per_page': config.page_size,
          'safe_search': '1', // 1 = safe search
          'tags': 'cats'
        }
      };
      if (config.is_chrome_app) {
        query.dataType = 'json';
        query.jsonp = false;
        query.data.nojsoncallback = 1;
      }
      $.ajax('https://api.flickr.com/services/rest/', query);
    });
  }
  loadImage(uri) {
    return new Promise(function(resolve, reject) {
      if (config.is_chrome_app) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (this.readyState === 4) {
            if (this.status === 200) {
              var url = window.URL || window.webkitURL;
              resolve(url.createObjectURL(this.response));
            } else {
              console.log(this);
              reject();
            }
          }
        };
        xhr.open('GET', uri, true);
        xhr.responseType = 'blob';
        xhr.send();
      } else {
         var img = new Image();
         img.src = uri;
         img.onload = () => {
           resolve(uri);
         };
         img.onerror = () => {
           reject(uri);
         };
      }
    });
  }
}

var app = new Infinicatr();
app.getLicenses().then(app.getMorePhotos).then(function() {
  app.changePhoto();
});

Mousetrap.bind('right', app.changePhoto.bind(app));
Mousetrap.bind('space', app.changePhoto.bind(app));
