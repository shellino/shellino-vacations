"use strict";

var gulp = require("gulp");

var paths;
var filters;

// File/folder handling modules
var rename = require("gulp-rename");

// Stream related modules
var merge = require("merge-stream");

gulp.task("copy", function () {
    return gulp.src([filters.fonts, filters.images], { base: paths.src, cwd: paths.src })
        .pipe(gulp.dest(paths.dest));
});

gulp.task("release-copy", function () {
    return gulp.src(["CNAME", "LICENSE"])
        .pipe(gulp.dest(paths.dest));
});


gulp.task("resource", function (done) {

    var streams = merge(),
        resources = Object.keys(paths.resources);

    if (resources.length > 0) {
        resources.forEach(function (resource) {

            var stream = gulp.src(resource, { cwd: paths.src, base: paths.resources[resource].base })
                .pipe(gulp.dest(paths.dest + paths.resources[resource].dest));

            streams.add(stream);
        });

        return streams;
    } else {
        done();
    }

});

var exported = {};

module.exports = function (_paths, _filters) {
    paths = _paths;
    filters = _filters;

    return exported;
};