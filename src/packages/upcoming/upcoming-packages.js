(function () {

    $(init);

    function init() {

        var nodes, isExpanded;

        nodes = {

            viewMoreLink: $(".view-more-link"),
            firstCostItem: $(".cost-item:nth-child(1)"),
            depatureDateNode: $(".departure-date-content"),
            heightAdjustor: $(".height-adjustor")
        };

        nodes.depatureDateNode.css({
            height: nodes.firstCostItem.outerHeight(true),
            overflow: "hidden"
        });

        isExpanded = false;

        nodes.viewMoreLink.on("click", function (event) {
            var height, text;

            event.preventDefault();

            height = isExpanded ? nodes.firstCostItem.outerHeight(true) : nodes.heightAdjustor.outerHeight(true);
            text = isExpanded ? "more options" : "hide options";

            nodes.depatureDateNode.animate({
                height: height,
            }, "normal", function () {
                nodes.viewMoreLink.text(text);
            });

            isExpanded = !isExpanded;
        });

    }

})();