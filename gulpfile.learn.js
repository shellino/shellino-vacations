var gulp = require('gulp');
var gutil = require("gulp-util");

// Stream related modules
var through = require("through2");
var through2 = require("through");

// File handling related modules
var del = require("del");
var fs = require("fs");
var glob = require("glob");
var path = require("path");

var paths = {
    dest: "./dist/",
    templates: "./templates/",
    src: "./src/"
};

gulp.task("clean", function (done) {
    del.sync([paths.dest + "/**/*"]);
    done();
});

gulp.task("default", ["test"]);

gulp.task("test", function () {

    gulp.src("./src/**/*.md")
        .pipe(testPlugin("1"))
        .pipe(function () {

            console.log("Two");

            return through.obj(function (file, enc, cb) {
                console.log("2");
                console.log(file._contents.toString());
                cb(null, file);
            });

        }())
        .pipe(testPlugin("3"));
});

function testPlugin(arg) {
    var fileTest;
    console.log(arg, "called testPlugin");

    function one(file, enc, cb) {
    //function one(file) {

        console.log(arg, "called start", file.history);
        if (!fileTest) {
            fileTest = file;
            //console.log(fileTest);
        }
        //console.log(Object.keys(file));
        //console.log(file._contents.toString())
        //this.push(file);
        cb();
    }

    function two(cb) {
        var joined;

        //console.log(fileTest.isBuffer());
        //console.log(fileTest.clone);

        console.log(arg, "calling end");

        joined = fileTest.clone({ contents: false });
        //joined = fileTest;

        joined.contents = new Buffer("This is good");


        //console.log(joined._contents.toString());
        this.push(joined);
        console.log(arg, "done end");
        cb();
        //this.emit("data", joined);
        //this.emit('end');

        console.log(arg, "called end");
    }

    return through.obj(one, two);
}

// Backup start from here
// Gulp specific
var gulp = require("gulp");

// File handling related
var fs = require("fs");

// Logger modules
var gutil = require("gulp-util");
var colors = gutil.colors;

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

var commonTasks = require("./gulpfile/gulpcommon.js")(gulpOptions);

gulpOptions.htmlPipeline = commonTasks.htmlPipeline;

//console.log(commonTasks.htmlPipeline);

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
        gulp.task("dev", ["clean", "copy", "handlebars", "html", "watchers"], function (done) {

            gutil.log(colors.bold.yellow("Watchers Established. You can now start coding."));
            done();
        });
        break;
}

gulp.task("default", ["dev"]);

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