// Gulp specific modules
var gulp = require("gulp");
var gulpFilter = require("gulp-filter");
var cache = require("gulp-cached");

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
var lazypipe = require("lazypipe");

// Templating related modules
var frontMatter = require("gulp-front-matter");
var handlebars = require("handlebars");
var markdown = require("gulp-markdown");

var pkg = require("./package.json");

var buildMode = process.argv[2] || "dev";

// System wide paths
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

var src = paths.src,
    dest = paths.dest,
    templates = paths.templates,
    templateRegistry = {},
    compiledTemplates = {};

registerHandlebarPartials();

var handleBarPipeline = function () {

    return lazypipe()
        .pipe(function () {
            return through2.obj(function (file, enc, cb) {

                var templateName = path.basename(file.path, ".hbs.html");

                compiledTemplates[templateName] = handlebars.compile(file.contents.toString());

                //this.push(file) should not be used as gulp will copy them in destination.
                //this.push(file);
                cb();
            }, function (cb) {
                cb();
            });
        })();
};

var htmlPipeline = function () {

    var mdFilter = gulpFilter("**/*.md");

    return lazypipe()
        .pipe(frontMatter, {
            property: "frontMatter",
            remove: true
        })
        .pipe(function () {
            return through2.obj(function (file, enc, cb) {
                var extension = path.extname(file.path);

                if (extension === ".md" || extension === ".html") {
                    templateRegistry[path.relative(process.cwd() + "/" + src, file.path)] = file.frontMatter.template;
                }

                this.push(file);
                cb();
            });
        })
        .pipe(function () {
            return mdFilter;
        })
        .pipe(markdown)
        .pipe(mdFilter.restore)
        .pipe(generateHtml)
        .pipe(mapUrl);
};

var renamePipeline = function () {
    return lazypipe()
        .pipe(rename, function (path) {

            path.dirname = path.dirname.replace(/topPages(\/)*(\\)*/g, "");

            if (path.dirname === "home" && path.basename === "home" && path.extname === ".html") {
                path.dirname = "";
                path.basename = "index";
            }

            if (path.extname === ".md") {
                path.extname = ".html";
            }

        })();
};

gulp.task("handlebars", function () {
    return gulp.src(["templates/**/*.hbs.html"], { base: src, cwd: src })
        .pipe(handleBarPipeline());
});

gulp.task("dev", ["clean", "handlebars"], function () {

    var htmlMdFilter = gulpFilter(["**/*.{html,md}", "!templates/**/*"]);

    return gulp.src(["**/*.*", "!templates/**/*"], { base: src, cwd: src })
        .pipe(htmlMdFilter)
        .pipe(htmlPipeline()())
        .pipe(htmlMdFilter.restore())
        .pipe(renamePipeline())
        .pipe(gulp.dest(dest));
});

gulp.task("watch", function (done) {

    gulp.watch([src + "**/*.{css,js,png,jpg}"], function (event) {
        // Do simple copy
        var file = getFileInfo(event);

        gulp.src(file, { base: src, cwd: src })
            .pipe(renamePipeline())
            .pipe(gulp.dest(dest).on("finish", function () {
                gutil.log("Modified:", colors.yellow(file));
            }));
    });

    gulp.watch([src + "**/*.{html,md}", "!" + src + "templates/**/*"], function (event) {
        var file = getFileInfo(event);

        gulp.src(file, { base: src, cwd: src })
            .pipe(htmlPipeline()())
            .pipe(renamePipeline())
            .pipe(gulp.dest(dest).on("finish", function () {
                gutil.log("Modified:", colors.yellow(file));
            }));
    });

    gulp.watch(src + "templates/*.*", function (event) {

        var file = getFileInfo(event),
            htmlfiles = [],
            templateName = path.basename(file, ".hbs.html");

        compiledTemplates[templateName] = handlebars.compile(fs.readFileSync(src + file).toString());
        gutil.log("Template:", colors.yellow(templateName));

        htmlfiles = Object.keys(templateRegistry).filter(function (key) {
            return templateRegistry[key] === templateName;
        });

        gulp.src(htmlfiles, { base: src, cwd: src })
            .pipe(htmlPipeline()())
            .pipe(renamePipeline())
            .pipe(gulp.dest(dest));
    });

    // When a partial is modified
    //gulp.watch(src + "", function () { });

    done();

    function getFileInfo(event) {
        return path.relative(process.cwd() + "/" + src, event.path);
    }
});

gulp.task("clean", function (done) {
    del.sync([dest]);
    done();
});

gulp.task("default", ["dev", "watch"], function () {
    gutil.log(colors.bold.yellow("Watchers Established. You can now start coding"));
    //console.log(templateRegistry);
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

function registerHandlebarPartials() {
    handlebars.registerPartial('indexHeader', fs.readFileSync(templates + "partials/indexHeader.hbs.html").toString());
}

//.pipe(function () {
//    return through2.obj(function (file, enc, cb) {
//        console.log("Filtered:", file.path);
//        this.push(file);
//        cb();
//    });
//})

//gulp.task("dev", ["clean"], function () {

//    var hbFilter = gulpFilter(["templates/**/*.hbs.html"]),
//        htmlMdFilter = gulpFilter(["**/*.{html,md}", "!templates/**/*"]);

//    return gulp.src("**/*.*", { base: src, cwd: src })
//        .pipe(hbFilter)
//        .pipe(handleBarPipeline())
//        .pipe(hbFilter.restore())
//        .pipe(htmlMdFilter)
//        .pipe(frontMatterPipeline())
//        .pipe(templateRegistryPipeline())
//        .pipe(htmlPipeline()())
//        .pipe(htmlMdFilter.restore())
//        .pipe(renamePipeline())
//        .pipe(gulp.dest(dest));
//});