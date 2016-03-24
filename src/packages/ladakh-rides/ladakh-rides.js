(function() {

    $(init);
    $(handleFormEvents);

    function init() {

        var nodes, isExpanded;

        nodes = {
            bookNowButton: $(".book-now-button"),
            contactRequestForm: $(".contact-request-form")
        };

        nodes.contactRequestForm.hide();

        isExpanded = false;

        nodes.bookNowButton.on("click", function(event) {
            var height;

            event.preventDefault();

            nodes.contactRequestForm.toggle(400);

            isExpanded = !isExpanded;
        });

    }

    function handleFormEvents() {
        
        var contactUsForm = $("#contact-form");
        var contactRequestForm = $(".contact-request-form");
        var bookNowButton = $(".book-now-button");
        
        contactUsForm.on('valid.fndtn.abide', function() {

            var formData;

            formData = {
                "Name": $("input[name='contactName']", contactUsForm).val(),
                "Email": $("input[name='contactEmail']", contactUsForm).val(),
                "Number": $("input[name='contactNumber']", contactUsForm).val(),
            };

            $.ajax({
                url: "//formspree.io/info@shellinovacations.com",
                method: "POST",
                data: formData,
                dataType: "json"
            })
            .then(function() {
                contactRequestForm
                    .addClass("animated zoomOutRight")
                    .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                        contactRequestForm.remove();
                        
                        bookNowButton
                            .html("<svg class='linea-icons icon-big'><use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='/svg/sprite.symbol.svg#icon-linea-arrows-checkbox'></use></svg>")
                            .append("<span class='inline-block'>Done</span>")
                            .prop('disabled', true);
                    });

            });

        });

        contactUsForm.on("invalid.fndtn.abide", function() {
            contactRequestForm
                .removeClass("animated shake")
                .addClass("animated shake")
                .one("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend", function() {
                    contactRequestForm.removeClass("animated shake");
                });
        });

    }


})();