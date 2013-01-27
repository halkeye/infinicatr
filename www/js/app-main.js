/*jshint browser:true, devel:true, jquery:true */
jQuery(document).ready(function() {
    "use strict";
    var $car = jQuery('#catCarousel .carousel-inner');
    var flickr = {
        key:'850775ffc1d6d95478d78bee0fdf4971'
    };
    var page = 0;
    var page_size = 5;

    var pendingMorePhotos = 0;
    var getMorePhotos = function(callback) {
      if (pendingMorePhotos) return;
      pendingMorePhotos = 1;
        $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickr.key + '&tags=cats&format=json&per_page='+page_size+'&jsoncallback=?&page='+page,function(data) {
          pendingMorePhotos = 0;
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
            if(callback)
                callback();
        });
    };
    getMorePhotos(function() {
      $car.children().eq(0).addClass('active');
    });
    jQuery('#catCarousel').swipe({
      swipe: function(event, direction, distance, fingerCount) {
        if (direction == "left") {
          $car.carousel('prev');
        }
        else if (direction == "right") {
          $car.carousel('next');
        }
        else { return; }
      },
      threshold:0,
      fingers:'all'
    });

    jQuery('#catCarousel-prev').bind('click', function(e) {
      $car.carousel('prev');
      e.preventDefault();
    });
    jQuery('#catCarousel-next').bind('click', function(e) {
      $car.carousel('next');
      e.preventDefault();
    });
    /*
    setInterval(function() {
        getMorePhotos();
    }, 5000);
    */

    // Could be slid or slide (slide happens before animation, slid happens after)
    $car.on('slide', function(data) {
      var $this = jQuery(this);
      var $active = $this.find('.item.active');
      var current = $car.children().index($active);
      if (current > $car.children().length - 3 /* threshold */) {
        getMorePhotos();
      }
    });

    $car.carousel();
});
