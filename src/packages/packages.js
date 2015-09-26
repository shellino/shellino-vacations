(function () {

    var nodes;

    /* Cached items */
    nodes = {
        hideFilterWrapper: $(".hide-button-wrapper"),
        hideFilters: $(".hide-filter-button"),

        showFilterWrapper: $(".show-button-wrapper"),
        showFilters: $(".show-filter-button"),

        filterSection: $("#packages-filter-section"),
        packagesPanelContent: $(".packages-panel-content")
    };

    /* On mobile device, show show-filter-panel button. For desktop, media query will override */
    nodes.showFilterWrapper.css("display", "block");

    nodes.showFilters.on("click", function () {

        /* Animate panel */
        nodes.packagesPanelContent.css("transform", "translate3d(0, 0, 0)");

        nodes.showFilterWrapper.css("display", "none");
        nodes.hideFilterWrapper.css("display", "block");
    });

    nodes.hideFilters.on("click", function () {

        /* Animate panel */
        nodes.packagesPanelContent.css("transform", "translate3d(-320px, 0, 0)");

        nodes.hideFilterWrapper.css("display", "none");
        nodes.showFilterWrapper.css("display", "block");
    });

    /* Add event handler on input chage */
    nodes.filterSection.on("change", ".checkbox-input", function () {
    });

})();