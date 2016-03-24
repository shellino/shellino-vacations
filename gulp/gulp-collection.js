"use strict";

// Gulp specific modules
var gulp = require("gulp");

// File/folder handling modules
var File = require("vinyl");
var fs = require("fs");
var path = require("path");

// Stream related modules
var through2 = require("through2");

// Templating related modules
var nunjucks = require("nunjucks");

// YAML related modules
var frontMatter = require("gulp-front-matter");

// Common utilities
var utils = require("./gulp-utils.js");
var collectionUtils = require("./gulp-collection-utils.js");

// Local data pased from master gulpfile.js
var config;
var buildMode;
var paths;
var filters;
var dataStore;


function paginationPipeline(files) {

    return gulp.src(files, { base: paths.src, cwd: paths.src })
        .pipe(frontMatter({
            property: "frontMatter",
            remove: true
        }))
        .pipe(through2.obj(function (file, enc, cb) {
            // This part of pipeline generates Context and collection required data

            var context = {}, collection;
            
            Object.assign(context, file.frontMatter, dataStore);
            delete file.frontMatter;

            file.collectionContext = context;
            this.push(file);

            cb();
        }))
        .pipe(through2.obj(function (file, enc, cb) {
            // This part of pipeline executes collectionCallback specified and gets pages to generate

            var context, collection, pages, collectionCallback;

            context = file.collectionContext;
            collection = context.collection;

            collectionCallback = collectionUtils[collection.generator];

            pages = collectionCallback(context, dataStore, file);

            file.pages = pages;
            this.push(file);

            cb();
        }))
        .pipe(through2.obj(function (file, enc, cb) {
            // This part of pipeline takes pages objects and generates actual files out of those.

            var pages, pipeline;

            pipeline = this;
            pages = file.pages;

            pages.forEach(function (page, index) {

                var template, output, context;
                var base, newFile;

                context = page.context;

                // First, compile content of each html/md file as template and execute against context
                output = nunjucks.renderString(file.contents.toString(), context, {
                    path: file.path
                });

                // Set the contents of context to output of first compilation
                context.contents = output;

                // Now execute master template against second compilation
                output = nunjucks.render(path.normalize(process.cwd() + "\\" + paths.templates + context.template + ".nunjucks"), context);

                base = path.join(file.path, '..');

                newFile = new File({
                    base: file.base,
                    path: path.normalize(path.join(base, "\\" + (page.urlPattern) + "\\index.html")),
                    contents: new Buffer(output)
                });

                pipeline.push(newFile);

            });

            cb();
        }))
        .pipe(gulp.dest(paths.dest));
}

gulp.task("collections", ["html"], function () {
    return paginationPipeline(filters.pagination);
});

var exported = {
    pipeline: paginationPipeline
};

module.exports = function (_paths, _filters, _config, _dataStore) {
    paths = _paths;
    filters = _filters;
    config = _config;
    dataStore = _dataStore;

    buildMode = config.buildMode;

    return exported;
};