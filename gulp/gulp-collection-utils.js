"use strict";

// Exposes blogList to the collection template
function generateBlogCollection(context, dataStore, collectionSourceFile) {

    var collection, pageSize, pageCount, pages;
    var counter, page;
    var listBeginning, listEnd;

    collection = context.collection;
    pageSize = collection.pageSize;
    pages = [];

    pageCount = Math.ceil(dataStore.blogs.length / pageSize);

    for (counter = 0; counter < pageCount; counter++) {
        page = {
            context: Object.create(context)
        };

        listBeginning = counter * pageSize;
        listEnd = counter + pageSize;

        page.context.blogList = dataStore.blogs.slice(listBeginning, listEnd);

        pages.push(page);
    }

    // To return - content, template, context, somesort of URL pattern
    return pages;
}

function generatePackagesPages(context, dataStore, collectionSrouceFile) {
    var collection, pages, page;

    collection = context.collection;
    pages = [];

    Object.keys(dataStore[collection.contextKey]).forEach(function (packageKey) {

        page = {
            context: Object.create(context),
            urlPattern: packageKey
        };

        page.context.currentPackageKey = packageKey;
        page.context.title = dataStore[collection.contextKey][packageKey].title;

        page.context.currentPackage = dataStore[collection.contextKey][packageKey];

        pages.push(page);
    });

    // To return - content, template, context, somesort of URL pattern
    return pages;
}

var exported = {
    generateBlogCollection: generateBlogCollection,
    generatePackagesPages: generatePackagesPages
};

module.exports = exported;