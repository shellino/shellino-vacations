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