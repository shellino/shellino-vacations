(function ($) {
    "use strict";

    $(document).ready(function () {
        initializeWall();
        loadIncredibleIndiaVideo();
    });

    function initializeWall() {

        var firstCover = $("#wall-background-0"),
            currentImage = 0,
            maxCount,
            wallImages;

        wallImages = getWallImages();
        maxCount = wallImages.length;
        wallImages[0].domNode = firstCover;

        loadImages(wallImages);

        setTimeout(initializeLooper, 6000);

        function loadImages(images) {

            loadImage(0);

            function loadImage(index) {
                var img = images[index];

                if(("iImage" in img) == false) {
                    img.iImage = new Image();
                    img.iImage.onload = function () {
                        if (index > 0) {
                            generateDom(index);
                        }

                        index++;
                        if(index < maxCount) {
                            loadImage(index);
                        }
                    }
                    img.iImage.src = img.src;
                }
            }
        }

        function initializeLooper() {

            if(wallImages[currentImage].iImage.complete) {
                var nextImage;

                nextImage = (currentImage + 1) % maxCount;

                if(wallImages[nextImage].iImage.complete) {
                    // CSS transform
                    wallImages[currentImage].domNode.addClass("zero-opacity");
                    wallImages[nextImage].domNode.removeClass("zero-opacity");
                    currentImage = nextImage;
                }
            }

            setTimeout(initializeLooper, 6000);
        }

        function generateDom(index) {

            var node = $("<div class='wall-background zero-opacity' data-index='" + index + "'></div>");
            wallImages[index].domNode = node;

            firstCover.after(node);
        }
    }

    function getWallImages() {
        var images;

        images = [{
            src: "/assets/img/walls/agra-fort-india-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/kanchanjanga-from-darjeeling-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/lord-shankar-at-namchi-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/lotus-temple-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/lakhnow-city-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/rajasthan-camel-fair-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/kerala-houseboat-1600x1000.jpg",
        }, {
            src: "/assets/img/walls/ladakh-near-photoskar-village-grazing-yaks-1600x1000.jpg",
        }];

        return images;
    }

    function loadIncredibleIndiaVideo () {
        var videoPanel = $("#incredible-india-video"),
            videoCover = $(".video-cover", videoPanel);

        videoCover.on("click", function () {
            var node = $("<iframe width='1280' height='720' frameborder='0' allowfullscreen></iframe>");

            node.attr("src", "//www.youtube-nocookie.com/embed/ChOAVBHc7gI?rel=0&amp;showinfo=0&amp;autohide=1&amp;theme=light&amp;color=white&amp;autoplay=1");
            node.appendTo(videoPanel);
            videoCover.addClass("hide");
        });
    }

}(jQuery));
