(function ($) {
    "use strict";


    $(document).ready(function () {
        initializeWall();
    });

    function initializeWall() {

        var currentImage = 0,
            maxCount,
            wallCarousel,
            wallImages;

        wallCarousel = $(".wall-carousel").slick({
            accessibility: false,
            autoplay: true,
            arrows: false,
            autoplaySpeed: 6000,
            draggable: false,
            fade: true,
            mobileFirst: true,
            speed: 400,
            slidesToScroll: 1,
            swipe: false,
            infinite: true,
            touchMove: false
        });

        wallCarousel.slick("slickPlay");

        wallImages = getWallImages();
        maxCount = wallImages.length;

        setTimeout(loadImages, 500);

        function loadImages() {

            loadImage(0);

            function loadImage(index) {
                var img = wallImages[index];

                if (("iImage" in img) == false) {
                    img.iImage = new Image();
                    img.iImage.onload = function () {
                        if (index > 0) {
                            wallCarousel.slick("slickAdd", generateDom(index));
                            wallCarousel.slick("slickPlay");
                        }

                        index++;
                        if (index < maxCount) {
                            loadImage(index);
                        }
                    }
                    img.iImage.src = img.src;
                }
            }
        }

        function generateDom(index) {

            var domString = "<div class='wall-background wall-background-index-" + index + "'></div>";

            return domString;
        }
    }

    function getWallImages() {
        var images;

        images = [{
            src: "/img/walls/kanchanjanga-from-darjeeling-1600x1000.jpg",
        }, {
            src: "/img/walls/lord-shankar-at-namchi-1600x1000.jpg",
        }, {
            src: "/img/walls/agra-fort-india-1600x1000.jpg",
        }];

        return images;
    }

})(jQuery);