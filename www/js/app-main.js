/*jshint browser:true, devel:true, jquery:true */
(function() {
    "use strict";
    var $car = jQuery('.carousel .carousel-inner');
    var flickr = {
        key:'850775ffc1d6d95478d78bee0fdf4971'
    };
    var page = 0;
    var getMorePhotos = function(callback) {
        $.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickr.key + '&tags=cats&format=json&per_page=3&jsoncallback=?&page='+page,function(data) {
            page++;
            jQuery.each(data.photos.photo, function(idx,elm) {
                var url = "http://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg"
                    .replace('{id}', elm.id)
                    .replace('{server-id}', elm.server)
                    .replace('{secret}', elm.secret)
                    .replace('{farm-id}', elm.farm);
                var $div = jQuery("<div>").addClass('item').appendTo($car);
                var $img = jQuery("<img>").attr('src', url ).appendTo($div);
            });
            if(callback)
                callback();
        });
    };
    getMorePhotos(function() {
        $car.children().eq(0).addClass('active');
    });
    setInterval(function() {
        getMorePhotos();
    }, 5000);

    jQuery('body').on('swipeleft swiperight', function (event) {
        //swiped to the left
        if (event.type == "swipeleft") {
            $car.carousel('prev');
        }
        //swiped to the right
        if (event.type == "swiperight") {
            $car.carousel('next');
        }
    });
    $car.on('slide', function(i) {
        var $this = jQuery(this);
        console.log("next[0]: ", $this);
        console.log("I am:", $this.parent().children().index($this));
    });
    $car.carousel();

})();
