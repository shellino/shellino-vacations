// Gulp specific modules
var gulp = require("gulp");
var gulpFilter = require("gulp-filter");
var cache = require("gulp-cached");
var sourcemaps = require("gulp-sourcemaps");

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
var gulpCheerio = require("gulp-cheerio");

// CSS, SASS, JS related modules
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");

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
var paths = (function () {

    var src = "./src/",
        bower = "./bower_components/";

    return {
        src: src,
        dest: "./dist/",
        bower: bower,
        js: "./js/",
        templates: src + "templates/",
        partials: src + "templates/partials/",
        fonts: [
            "foundation-icon-fonts/",
            "slick.js/slick/fonts/",
            "!foundation-icon-fonts/svgs/"
        ],
        jsBundle: [
            bower + "jquery/dist/jquery.js",
            bower + "fastclick/lib/fastclick.js",
            bower + "foundation/js/foundation.js",
            bower + "slick.js/slick/slick.js",
            src + "js/app.js"
        ]
    };
})();

// File selection filters
var filters = (function () {
    return {
        all: "**/*.*",
        js: "**/*.js",
        md: "**/*.md",
        scss: "**/*.scss",
        html: "**/*.html",
        mdhtml: "**/*.{md,html}",
        fonts: "**/*.{eot,svg,ttf,woff}",
        templates: "**/*.hbs.html"
    };
})();


// Local variables used throughout
var templateRegistry = {},
    compiledTemplates = {};

registerHandlebarPartials();

var handleBarPipeline = function () {

    return lazypipe()
        .pipe(gulpCheerio, function ($, file) {

            var title = $("title"),
                scriptTag = $("<script type='text/javascript'></script>")
                linkTag = $("<link type='text/css' rel='stylesheet' />")

            title.after(linkTag.clone().attr("href", "/scss/main.css"));
            title.after(linkTag.clone().attr("href", "http://fonts.googleapis.com/css?family=Source+Sans+Pro:400,300,300italic,400italic,600,600italic,700,700italic,900,900italic"));

            $("head").append(scriptTag.clone().attr("src", "/js/modernizr.js"));

            $("body").contents().filter(function () {

                if (this.nodeType === 8 && this.data === "bundle.js") {
                    $(this).after(scriptTag.clone().attr("src", "/js/bundle.js"));
                }

                return true;
            });

        })
        .pipe(function () {
            return through2.obj(function (file, enc, cb) {

                var templateName = path.basename(file.path, ".hbs.html"),
                    contents = file.contents.toString().replace("{{&gt;", "{{>");

                //console.log(file.contents.toString());

                compiledTemplates[templateName] = handlebars.compile(contents);

                //this.push(file) should not be used as gulp will copy them in destination.
                //this.push(file);
                cb();
            }, function (cb) {
                cb();
            });
        })();
};

var sassPipeline = function () {

    var sassFilter = gulpFilter(filters.scss);

    return lazypipe()
        .pipe(function () {
            return sassFilter;
        })
        .pipe(sourcemaps.init)
        .pipe(sass)
        .pipe(sourcemaps.write, ".", { addComment: false })
        .pipe(appendSourcemap, ".css")
        .pipe(sassFilter.restore)();
};

var htmlPipeline = function () {

    var mdFilter = gulpFilter(filters.md);

    return lazypipe()
        .pipe(frontMatter, {
            property: "frontMatter",
            remove: true
        })
        .pipe(function () {
            return through2.obj(function (file, enc, cb) {
                var extension = path.extname(file.path);

                if (extension === ".md" || extension === ".html") {
                    templateRegistry[path.relative(process.cwd() + "/" + paths.src, file.path)] = file.frontMatter.template;
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

var uglifyPipeline = function () {

    var jsFilter = gulpFilter(filters.js),
        pipeline = lazypipe();

    if (buildMode == "prod") {
        pipeline = pipeline.pipe(function () {
            return jsFilter;
        })
        .pipe(sourcemaps.init)
        .pipe(uglify)
        .pipe(sourcemaps.write, ".", { addComment: false })
        .pipe(appendSourcemap, ".js")
        .pipe(jsFilter.restore);
    } else {
        pipeline = pipeline.pipe(gutil.noop);
    }

    return pipeline();
};

gulp.task("handlebars", function () {
    return gulp.src(filters.templates, { base: paths.src, cwd: paths.templates })
        .pipe(handleBarPipeline());
});

gulp.task("fonts", function () {

    var fonts = paths.fonts.map(function (fontPath) {
        return fontPath + filters.fonts;
    });

    return gulp.src(fonts, {
        cwd: paths.bower
    })
    .pipe(gulp.dest(paths.dest + "scss/"));
});

gulp.task("build", ["clean", "handlebars", "fonts"], function () {

    var htmlMdFilter = gulpFilter([filters.mdhtml]),
        sourceStream,
        modernizrStream,
        bundleStream;

    sourceStream = gulp.src([filters.all, "!" + filters.templates], { base: paths.src, cwd: paths.src })
        .pipe(htmlMdFilter)
        .pipe(htmlPipeline()())
        .pipe(htmlMdFilter.restore())
        .pipe(sassPipeline())
        .pipe(renamePipeline())
        .pipe(uglifyPipeline())
        .pipe(gulp.dest(paths.dest));

    bundleStream = gulp.src(paths.jsBundle)
        .pipe(gulp.dest(paths.dest + paths.js))
        .pipe(sourcemaps.init())
        .pipe(concat("bundle.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write(".", { addComment: false }))
        .pipe(appendSourcemap(".js"))
        .pipe(gulp.dest(paths.dest + paths.js));

    modernizrStream = gulp.src(paths.bower + "modernizr/modernizr.js")
        .pipe(uglifyPipeline())
        .pipe(gulp.dest(paths.dest + paths.js));

    return merge(sourceStream, bundleStream, modernizrStream);
});

gulp.task("watch", function (done) {

    gulp.watch([paths.src + "**/*.{js,png,jpg}"], function (event) {
        // Do simple copy
        var file = getFileInfo(event);

        gulp.src(file, { base: paths.src, cwd: paths.src })
            .pipe(renamePipeline())
            .pipe(gulp.dest(paths.dest).on("finish", function () {
                gutil.log("Modified:", colors.yellow(file));
            }));
    });

    gulp.watch([paths.src + "**/*.scss"], function (event) {
        // Do simple copy
        var file = getFileInfo(event),
            files = [file];

        if (file.indexOf("scss") === 0) {
            files[1] = "scss/main.scss";
        }

        gulp.src(files, { base: paths.src, cwd: paths.src })
            .pipe(sassPipeline())
            .pipe(renamePipeline())
            .pipe(gulp.dest(paths.dest).on("finish", function () {
                gutil.log("Modified:", colors.yellow(file));
            }));
    });


    gulp.watch([paths.src + "**/*.{html,md}", "!" + paths.src + "templates/**/*"], function (event) {
        var file = getFileInfo(event);

        gulp.src(file, { base: paths.src, cwd: paths.src })
            .pipe(htmlPipeline()())
            .pipe(renamePipeline())
            .pipe(gulp.dest(paths.dest).on("finish", function () {
                gutil.log("Modified:", colors.yellow(file));
            }));
    });

    gulp.watch(paths.src + "templates/*.*", function (event) {

        var file = getFileInfo(event),
            htmlfiles = [],
            templateName = path.basename(file, ".hbs.html");

        compiledTemplates[templateName] = handlebars.compile(fs.readFileSync(paths.src + file).toString());
        gutil.log("Template:", colors.yellow(templateName));

        htmlfiles = Object.keys(templateRegistry).filter(function (key) {
            return templateRegistry[key] === templateName;
        });

        gulp.src(htmlfiles, { base: paths.src, cwd: paths.src })
            .pipe(htmlPipeline()())
            .pipe(renamePipeline())
            .pipe(gulp.dest(paths.dest));
    });

    // When a partial is modified
    //gulp.watch(src + "", function () { });

    done();

    function getFileInfo(event) {
        return path.relative(process.cwd() + "/" + paths.src, event.path);
    }
});

gulp.task("clean", function (done) {
    del.sync([paths.dest]);
    done();
});

gulp.task("dev", ["build", "watch"], function (done) {
    gutil.log(colors.bold.yellow("Watchers Established. You can now start coding."));
    done();
});

gulp.task("prod", ["build"], function (done) {
    gutil.log(colors.bold.yellow("Product build is ready."));
});

gulp.task("default", ["dev"], function (done) {
    done();
});

function appendSourcemap(extension) {
    return through2.obj(function (file, enc, cb) {

        var filename = path.basename(file.path),
            contents = file.contents.toString(),
            sourceMapComment;

        if (path.extname(file.path) === extension) {

            if (extension === ".js") {
                sourceMapComment = "//# sourceMappingURL=./" + filename + ".map";
            } else {
                sourceMapComment = "/*# sourceMappingURL=./" + filename + ".map */";
            }

            contents += sourceMapComment;
            file.contents = new Buffer(contents);
        }

        this.push(file);
        cb();
    });
}

function generateHtml() {
    return through2.obj(function (file, enc, cb) {
        var yaml = file.frontMatter,
            compiledTemplate = compiledTemplates[yaml.template],
            templateOutput;

        templateOutput = compiledTemplate({
            contents: file.contents.toString(),
            scss: yaml.scss,
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
    handlebars.registerPartial('indexHeader', fs.readFileSync(paths.partials + "indexHeader.hbs.html").toString());
}