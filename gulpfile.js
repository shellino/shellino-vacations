var gulp = require('gulp'),
    exec = require('child_process').exec;

gulp.task("watch", function () {
    gulp.watch("./templates/**/*.*", ["build"]);
    gulp.watch("./src/**/*.*", ["build"]);
});

gulp.task("build", function () {
    exec("node index.js", function (error, stdout, stderr) {
        console.log("Status: " + stdout);
    });
});

gulp.task("default", ["watch", "build"]);
