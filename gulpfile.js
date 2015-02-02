
// Gulp specific
var gulp = require("gulp");

// File handling related
var fs = require("fs");

// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

var pkg = require("./package.json");

var buildMode = process.argv[2] || "dev";

var paths = {
    dest: "./dist/",
    src: "./src/",
    templates: "./src/templates/"
};

// Gulp options
var gulpOptions = {
    gulp: gulp,
    src: paths.src,
    templates: paths.templates,
    dest: paths.dest,
    mode: buildMode
};

require("./gulpfile/gulpcommon.js")(gulpOptions);

switch (buildMode) {
    case "prod":
        require("./gulpfile/gulpprod.js")(gulpOptions);
        gulp.task("prod", ["clean", "copy", "browserify", "sass"], function (done) {
            gutil.log(colors.bold.yellow("Build package is created."));
            done();
        });
        break;

    case "dev":
        require("./gulpfile/gulpdev.js")(gulpOptions);
        gulp.task("dev", ["clean", "copy", "handlebars", "html"], function (done) {

            gutil.log(colors.bold.yellow("Watchers Established. You can now start coding."));
            done();
        });
        break;
}

gulp.task("default", ["dev"]);
