"use strict";

// Templating related modules
var nunjucks = require("nunjucks");

// File/folder handling modules
var fs = require("fs");

var config;
var paths;
var filters;

var exported = {};

nunjucks.configure({
    autoescape: true,
    watch: false
});

module.exports = function (_paths, _filters, _config) {
    paths = _paths;
    filters = _filters;
    config = _config;


    return exported;
};