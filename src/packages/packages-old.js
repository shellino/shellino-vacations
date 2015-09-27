/*$(function () {

    var $sidebar, $window, offset, topPadding, timeout, tranlateY;

    $sidebar = $("#packages-filter-section"),
    $window = $(window),
    offset = $sidebar.offset(),
    topPadding = 0;

    $window.scroll(function () {
        clearTimeout(timeout);
        timeout = setTimeout(updateSidebarDisplacement, 50);
    });

    function updateSidebarDisplacement() {

        if ($window.scrollTop() > offset.top) {
            tranlateY = $window.scrollTop() - offset.top + topPadding;

            $sidebar.stop().animate({
                //transform: "translate3d(0, " + tranlateY + "px, 0)"
                marginTop: tranlateY
            });
        } else {
            $sidebar.stop().animate({
                //transform: "translate3d(0, 0, 0)"
                marginTop: 0
            });
        }
    }

});*/