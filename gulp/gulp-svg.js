"use strict";

var gulp = require("gulp");

// SVG and sprite related modules
var svgSprite = require("gulp-svg-sprite");

// Local data pased from master gulpfile.js
var config;
var paths;
var filters;

gulp.task("svg-sprite", function () {
    var spriteConfig = {
        shape: {
            id: {
                separator: "-",
                whitespace: "-",
                generator: config.pkg.props.iconPrefix + "-%s"
            }
        },
        mode: {
            symbol: {
                dest: "."
                //example: true
            }
        }
    };

    return gulp.src([filters.svg], { base: paths.icons, cwd: paths.icons })
        .pipe(svgSprite(spriteConfig))
        .pipe(gulp.dest(paths.dest));
});

var exported = {};

module.exports = function (_paths, _filters, _config) {
    paths = _paths;
    filters = _filters;
    config = _config;

    return exported;
};