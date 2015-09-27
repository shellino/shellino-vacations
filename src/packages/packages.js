(function () {

    var nodes, packages, filtersInfo, appliedFilters, $window;

    /* Cached items */
    nodes = {
        hideFilterWrapper: $(".hide-button-wrapper"),
        hideFilters: $(".hide-filter-button"),

        showFilterWrapper: $(".show-button-wrapper"),
        showFilters: $(".show-filter-button"),

        filterSection: $("#packages-filter-section"),
        packagesPanelContent: $(".packages-panel-content"),
        packages: $(".packages-list-item"),

        filterSelectionStatus: $(".filter-selection-status-panel"),

        checkboxInput: ".checkbox-input"
    };

    init();

    /* On mobile device, show show-filter-panel button. For desktop, media query will override */
    nodes.showFilterWrapper.css("display", "block");

    nodes.showFilters.on("click", function () {

        /* Animate panel */
        nodes.packagesPanelContent.css("transform", "translate3d(0, 0, 0)");

        scrollToFilterList();

        nodes.showFilterWrapper.css("display", "none");
        nodes.hideFilterWrapper.css("display", "block");
    });

    nodes.hideFilters.on("click", function () {

        /* Animate panel */
        nodes.packagesPanelContent.css("transform", "translate3d(-320px, 0, 0)");

        scrollToFilterList();

        nodes.hideFilterWrapper.css("display", "none");
        nodes.showFilterWrapper.css("display", "block");
    });

    /* Add event handler on input chage */
    nodes.filterSection.on("change", nodes.checkboxInput, function () {
        var node, filter, searchIndex;

        /* Wrap as jQuery element */
        node = $(this);
        filter = node.val();

        /* Try to see if filter is already applied */
        searchIndex = appliedFilters.indexOf(filter);

        if (searchIndex > -1) {
            /* Unchecked the filter */
            appliedFilters.splice(searchIndex, 1);

        } else {
            /* Checked the filter. Apply it. */
            appliedFilters.push(filter);
        }

        applyFilter();

    });

    function scrollToFilterList() {

        setTimeout(function () {
            $("html, body").animate({
                scrollTop: nodes.filterSection.offset().top
            }, 800);
        }, 200);
    }

    function applyFilter() {

        var packagesToShow, categorisedFilters;

        categorisedFilters = categoriseFilter(appliedFilters);

        /* Loop over each filter */
        packagesToShow = Object.keys(categorisedFilters).reduce(function (_packages, category) {

            var filters;

            /* Filters in category */
            filters = categorisedFilters[category];

            /* Loop over each item and filter */
            return _packages.filter(function (packageItem) {
                /* Check if packageItem has any of the following filters in question */
                return filters.some(function (filter) {
                    return packageItem.categories.indexOf(filter) > -1 ? true : false;
                });
            });

        }, packages);

        /* If appliedFilters are zero then packagesToShow should be 0 */
        if (appliedFilters.length === 0) {
            packagesToShow = [];
        }

        packages.forEach(function (packageItem) {
            packageItem.node.css("display", packagesToShow.indexOf(packageItem) > -1 ? "block": "none");
        });

        /* Update filter selection status */
        updateFilterSelectionStatus(appliedFilters, packagesToShow);
    }

    /* Map filters as per their categories */
    function categoriseFilter(filters) {

        var categorisedFilters;

        categorisedFilters = {};

        filters.forEach(function (filter) {
            var category;

            category = filtersInfo[filter];

            if (!categorisedFilters.hasOwnProperty(category)) {
                categorisedFilters[category] = [];
            }

            categorisedFilters[category].push(filter);
        });

        return categorisedFilters;
    }

    function updateFilterSelectionStatus(appliedFilters, packagesToShow) {

        var fragment = $(document.createDocumentFragment());

        if (packagesToShow.length > 0) {
            $("<li class='current'>Filters:</li>").appendTo(fragment);
        }

        appliedFilters.forEach(function (filter) {
            $("<li class='current'>" + filter + "</li>").appendTo(fragment);
        });

        /* Update the status count */
        $("<li class='current available-packages-status'>" + packagesToShow.length + " vacations available</li>").appendTo(fragment);

        nodes.filterSelectionStatus.html("");
        nodes.filterSelectionStatus.append(fragment);
    }

    /* Initialize */
    function init() {
        $window = $(window);
        appliedFilters = [];
        buildFilterInfo();
        buildUI();

        /* By default, select group tours */
        appliedFilters = ["group"];
        applyFilter();
    }

    /* Build filter information - TODO (build from HTML information) */
    function buildFilterInfo() {
        filtersInfo = {
            "group": "category",
            "adventure": "category",
            "honeymoon": "category",
            "pilgrimage": "category",
            "wildlife": "category",
            "women": "category",
            "north-india": "location",
            "south-india": "location",
            "east-india": "location",
            "west-india": "location",
            "north-east-india": "location",
        };
    }

    /* Build information of all the packages by crawling DOM */
    function buildUI() {
        var iteration, count, packageItem;

        count = nodes.packages.length;
        iteration = 0;
        packages = new Array(count);

        while (iteration < count) {

            packageItem = $(nodes.packages[iteration]);

            packages[iteration] = {
                node: packageItem,
                categories: packageItem.data("filter-categories").split(",")
            };

            iteration++;
        }
    }

})();