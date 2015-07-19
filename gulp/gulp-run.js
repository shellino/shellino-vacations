"use strict";

// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

// Templating related modules
var nunjucks = require("nunjucks");

// Gulp specific modules
var gulp = require("gulp");

gulp.task("common", ["copy", "svg-sprite", "data-store", "collections", "html", "sass", "js", "jsbundle", "resource"]);

gulp.task("dev", ["common", "watcher"], function (done) {
    gutil.log(colors.bold.yellow("Watchers Established. You can now start coding."));

    //nunjucks.configure({
    //    autoescape: true,
    //    watch: true
    //});

    done();
});

gulp.task("release", ["release-copy", "common"], function (done) {
    gutil.log(colors.bold.yellow("Product build is ready."));
    done();
});

gulp.task("default", ["release"], function (done) {
    done();
});

var exported = {};

module.exports = function () {
    return exported;
};