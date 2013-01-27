/*jshint browser:true, devel:true, jquery:true */
jQuery(document).ready(function() {
  "use strict";
  var $car = jQuery('#catCarousel .carousel-inner');
  var $pending = jQuery('#loading_flickr_indicator').hide();
  var flickr = {
    key:'850775ffc1d6d95478d78bee0fdf4971'
  };
  var config = {};
  config.pending_message = "Please wait. Fetching more content";
  config.page_size = 10;
  config.pending_photos_threshold = Math.floor(config.page_size*1/3);
  config.max_photos = config.page_size * 3;

  var page = 0;
  var pendingMorePhotos = 0;
  var getMorePhotos = function(callback) {
    if (pendingMorePhotos) return;
    $pending.show();
    pendingMorePhotos = 1;
    $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickr.key + '&tags=cats&format=json&per_page='+config.page_size+'&jsoncallback=?&page='+page,function(data) {
      pendingMorePhotos = 0;
      $pending.hide();
      page++;
      jQuery.each(data.photos.photo, function(idx,elm) {
        // http://www.flickr.com/services/api/misc.urls.html
        var url = "http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_z.jpg"
          .replace('{id}', elm.id)
          .replace('{server-id}', elm.server)
          .replace('{secret}', elm.secret)
          .replace('{farm-id}', elm.farm);
        var $div = jQuery('<div>').attr('id', 'flickr_photo_' +elm.id).addClass('item').appendTo($car);
        var $img = jQuery('<img>').attr('src', url ).appendTo($div);
      });
      /* None are active on screen yet */
      if ($car.find('.active').length === 0)
      {
          $car.children().eq(0).addClass('active');
      }
      if ($car.children().length > config.max_photos) {
          /* Anything above the max we want on a page we should remove */
          var removalCount = $car.children().length - config.max_photos;
          console.log("Removing ", removalCount, " Photos");
          $car.children().filter(':not(.active):lt('+removalCount+')').remove();
      }
      if(callback)
        callback();
    });
  };
  getMorePhotos(function() {
  });
  var swipeEventFunction = function(event, direction, distance, fingerCount) {
    if (direction == "left") {
      $car.carousel('prev');
    }
    else if (direction == "right") {
      if (!pendingMorePhotos) {
        $car.carousel('next');
      } else {
        alert(config.pending_photos_threshold);
      }
    }
    else { return; }
  };
  jQuery('#catCarousel').swipe({
    swipe: swipeEventFunction,
    threshold:0,
    fingers:'all'
  });

  jQuery('#catCarousel-prev').bind('click', function(e) {
    $car.carousel('prev');
    e.preventDefault();
  });
  jQuery('#catCarousel-next').bind('click', function(e) {
    if (!pendingMorePhotos) {
      $car.carousel('next');
    } else {
      alert(config.pending_photos_threshold);
    }
    e.preventDefault();
  });

  // Could be slid or slide (slide happens before animation, slid happens after)
  $car.on('slide', function(data) {
    var $this = jQuery(this);
    var $active = $this.find('.item.active');
    var current = $car.children().index($active);
    if (current > $car.children().length - config.pending_photos_threshold /* threshold */) {
      getMorePhotos();
    }
  });

  $car.carousel();
});
