"use strict";

// Templating related modules
var nunjucks = require("nunjucks");

// File/folder handling modules
var fs = require("fs");

var config;
var paths;
var filters;
var buildMode;

var exported = {};

module.exports = function (_paths, _filters, _config) {
    paths = _paths;
    filters = _filters;
    config = _config;

    buildMode = config.buildMode;

    nunjucks.configure("./src/templates/", {
        autoescape: true,
        watch: buildMode === "dev"
    });

    return exported;
};