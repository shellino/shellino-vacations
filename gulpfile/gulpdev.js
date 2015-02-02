// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

// File/folder handling modules
var path = require("path");
var fs = require("fs");
var cheerio = require("cheerio");

var glob = require("glob");

// CSS, SASS related modules
var sass = require('gulp-sass');

module.exports = function (options) {

    var gulp = options.gulp,
        dest = options.dest;

    // Typically dest = "./dist/" unless changed in bundle.json

    gulp.task("watchers", function (done) {

        gulp.watch(["./src/**/*.html", "./src/**/*.css", "./src/**/*.json", "./src/**/*.js"], function (event) {
            var modifiedFile = path.relative(process.cwd() + "/src", event.path),
                destDirectory = dest + path.dirname(modifiedFile);

            gulp.src("./src/" + modifiedFile)
                .pipe(gulp.dest(destDirectory).on("finish", function () {
                    gutil.log("Modified:", colors.yellow(modifiedFile));
                }));
        });

        gulp.watch(["./src/**/*.scss"], function (event) {
            var modifiedFile = path.relative(process.cwd() + "/src", event.path),
                destDirectory = dest + path.dirname(modifiedFile);

            gulp.src(["./src/" + modifiedFile, "./src/commons/css/main.scss"])
                .pipe(sass())
                .pipe(gulp.dest(function (file) {
                    return dest + path.relative(process.cwd() + "/src", file.base);
                }).on("finish", function () {
                    gutil.log("Modified:", colors.yellow(modifiedFile));
                }));
        });

        done();
    });

    gulp.task("html2", ["clean", "copy"], function (cb) {

        var indexContent,
            folders,
            $;

        indexContent = fs.readFileSync("./src/index.html");

        folders = getFolders("./src/");

        folders.filter(function (folderName) {
            return folderName !== "commons";
        }).forEach(function (folderName) {

            $ = cheerio.load(indexContent.toString());
            $("body").append("<script type='text/javascript' src='home.js'>");

            fs.writeFileSync(dest + folderName + "/index.html", $.html().replace("&#xFEFF;", ""));
        });

        cb();
    });

    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    }
};