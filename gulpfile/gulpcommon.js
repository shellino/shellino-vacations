// Gulp specific stuff
var gulpFilter = require("gulp-filter");

// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

// File/folder handling modules
var del = require("del");
var fs = require("fs");
var glob = require("glob");
var path = require("path");
var rename = require("gulp-rename");

// DOM parser modules
var cheerio = require("cheerio");

// CSS, SASS related modules
var sass = require('gulp-sass');

// Stream related modules
var merge = require("merge-stream");
var through2 = require("through2");

// Templating related modules
var frontMatter = require("gulp-front-matter");
var handlebars = require("handlebars");
var markdown = require("gulp-markdown");

module.exports = function (options) {

    var gulp = options.gulp,
        src = options.src,
        dest = options.dest,
        templates = options.templates,
        compiledTemplates = {};

    handlebars.registerPartial('indexHeader', fs.readFileSync(templates + "partials/indexHeader.hbs.html").toString());

    gulp.task("clean", function (done) {
        del.sync([options.dest]);
        done();
    });

    gulp.task("copy", ["clean"], function () {
        var staticPipeline = gulp.src(["commons/**/*", "vendor/**/*"], { base: src, cwd: src })
            .pipe(gulp.dest(dest));

        var topPagesPipeline = gulp.src(["topPages/**/*.{css,js}"], { cwd: src })
            .pipe(gulp.dest(dest));

        return merge(staticPipeline, topPagesPipeline);
    });

    gulp.task("handlebars", ["clean"], function () {
        return gulp.src(templates + "**/*.hbs.html")
            .pipe(through2.obj(function (file, enc, cb) {
                compiledTemplates[path.basename(file.path, ".hbs.html")] = handlebars.compile(file.contents.toString());
                cb();
            }));
    });

    gulp.task("html", ["clean", "handlebars"], function () {

        var mdFilter = gulpFilter("**/*.md");

        gulp.src(["./**/*.{html,md}"], { cwd: src + "topPages/" })
            .pipe(frontMatter({
                property: "frontMatter",
                remove: true
            }))
            .pipe(mdFilter)
            .pipe(markdown())
            .pipe(mdFilter.restore())
            .pipe(generateHtml())
            .pipe(mapUrl())
            .pipe(rename(function (path) {
                if (path.dirname === "home") {
                    path.dirname = "";
                    path.basename = "index";
                }
                path.extname = ".html";
            }))
            .pipe(gulp.dest(dest));
    });

    gulp.task("sass", ["clean"], function () {
        return gulp.src(["./src/**/*.scss"])
            .pipe(sass())
            .pipe(gulp.dest(dest));
    });

    function generateHtml() {
        return through2.obj(function (file, enc, cb) {
            var yaml = file.frontMatter,
                compiledTemplate = compiledTemplates[yaml.template],
                templateOutput;

            templateOutput = compiledTemplate({
                contents: file.contents.toString(),
                css: yaml.css,
                js: yaml.js
            });

            file.contents = new Buffer(templateOutput);

            this.push(file);
            cb();
        });
    }

    function mapUrl() {
        return through2.obj(function (file, enc, cb) {

            var html = file.contents.toString(),
                $;

            $ = cheerio.load(html);

            $("a[href]").each(function (index) {
                var item = $(this);

                //console.log(item.attr("href"), ":", getNormalizedUrl(item.attr("href")));
                item.attr("href", getNormalizedUrl(item.attr("href")));
            });

            file.contents = new Buffer($.html().replace("&#xFEFF;", ""));

            this.push(file);
            cb();
        });
    }

    function getNormalizedUrl(rawUrl) {

        var normalizedUrl = "";

        //rawUrl = path.normalize(rawUrl).replace(new RegExp(escapeRegExp("\\"), 'g'), "/");
        rawUrl = path.normalize(rawUrl).replace(new RegExp("\\\\", 'g'), "/");

        if (rawUrl === "" || rawUrl === "/") {
            normalizedUrl = "/";
        } else if (rawUrl === "#") {
            normalizedUrl = "#";
        } else {

            // Path should be normalized. Outside of directory
            // Get rid of all the ../ at the beginning of path
            rawUrl = rawUrl.replace(new RegExp("\\.\\.\/", "g"), "/");
            rawUrl = rawUrl.replace(new RegExp("\/\/+"), "/");

            if (/^((\/topPages)?\/home\/home.html)$/g.test(rawUrl)) {
                normalizedUrl = "/";
            } else if (/^(\/topPages){1}/g.test(rawUrl)) {
                normalizedUrl = rawUrl.replace("/topPages", "");
            } else if (/^([a-z|A-Z])+/g.test(rawUrl)) {
                normalizedUrl = rawUrl;
            } else {
                normalizedUrl = "#invalid";
            }
        }

        normalizedUrl = normalizedUrl.replace(".md", ".html");

        return normalizedUrl;
    }

    function escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    }
};