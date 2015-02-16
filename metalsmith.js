// package.json entries
/*
    "metalsmith": "^1.0.1",
    "metalsmith-assets": "^0.1.0",
    "metalsmith-branch": "0.0.4",
    "metalsmith-collections": "^0.6.0",
    "metalsmith-copy": "^0.2.0",
    "metalsmith-markdown": "^0.2.1",
    "metalsmith-permalinks": "^0.4.0",
    "metalsmith-relative": "^1.0.3",
    "metalsmith-serve": "0.0.3",
    "metalsmith-templates": "^0.6.0",
    "metalsmith-watch": "^0.1.1",
    "rimraf": "^2.2.8"
*/
var //assets = require('metalsmith-assets'),
    branch = require('metalsmith-branch'),
    collections = require('metalsmith-collections'),
    copy = require("metalsmith-copy"),
    fs = require("fs"),
    handlebars = require('handlebars'),
    markdown = require('metalsmith-markdown'),
    metalsmith = require('metalsmith'),
    path = require('path'),
    permalinks = require('metalsmith-permalinks'),
    relative = require('metalsmith-relative'),
    rimraf = require("rimraf"),
    serve = require('metalsmith-serve');
    templates = require('metalsmith-templates');
    //watch = require("metalsmith-watch");

handlebars.registerPartial('indexHeader', fs.readFileSync(__dirname + '/templates/partials/indexHeader.html').toString());

handlebars.registerHelper("mapUrl", function(rawUrl) {
    var returnUrl = "#";

    rawUrl = path.normalize(rawUrl);
    rawUrl = rawUrl.replace(new RegExp(escapeRegExp("\\"), 'g'), "/");

    //console.log(rawUrl);
    if(rawUrl.length > 1 && rawUrl[0] !== "/") {
        rawUrl = "/" + rawUrl;
    }

    returnUrl = urlContext[rawUrl] || "#";

    return returnUrl;
});

var urlContext = {
    "/": "/"
};

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

var rawUrlExtractor = function(files, metalsmith, done) {
    var fileKeys = Object.keys(files);

    fileKeys.forEach(function (file) {
        var normalized = path.normalize(file);

        normalized = normalized.replace(new RegExp(escapeRegExp("\\"), 'g'), "/");
        if(normalized.length > 1 && normalized[0] !== "/") {
            normalized = "/" + normalized;
        }
        urlContext[normalized] = "";
        files[file].rawUrl = normalized;
        //console.log(normalized);
    });

    done();
};

var rawUrlSubstituter = function (files, metalsmith, done) {
    var fileKeys = Object.keys(files);

    fileKeys.forEach(function (file) {
        var normalized = path.normalize(file);

        normalized = normalized.replace(new RegExp(escapeRegExp("\\"), 'g'), "/");
        if(normalized.length > 1 && normalized[0] !== "/") {
            normalized = "/" + normalized;
        }
        urlContext[files[file].rawUrl] = normalized;
    });

    urlContext["/top-pages/home/home.html"] = "/";
    //console.log(urlContext);

    fileKeys.forEach(function (file) {
        var templateScript,
            template,
            content;

        if(file.indexOf(".html") > -1) {
            templateScript = files[file].contents.toString();
            template = handlebars.compile(templateScript);
            content = template(urlContext);
            //console.log(typeof content);
            files[file].contents = new Buffer(String(content));
        }
    });

    done();
};

metalsmith(__dirname)
    .clean(true)
    .use(rawUrlExtractor)
    .use(markdown())
    .use(branch()
        .pattern("top-pages/**/*.*")
        .use(permalinks({
            pattern: ":title",
            relative: true
        }))
        .use(relative({
            methodName: "relative"
        }))
        .use(templates('handlebars'))
    )
    .use(rawUrlSubstituter)
    .destination('./build')
    .build(function (err, files) {

        if(err) {
            console.log("Failed");
            console.log(err);
        } else {
            postMetalsmithBuild();
            console.log("Success");
        }

        /*Object.keys(files).forEach(function(key) {
            console.log(key);
        });*/


    });

function postMetalsmithBuild () {
    rimraf('./build/top-pages', function(err) {
        if (err) {
            throw err;
        }
    });

    fs.rename("./build/home/index.html", "./build/index.html", function () { });
}

/*
Alternative for branch
    .use(collections({
        pages: {
            pattern: "top-pages/** /*.*"
        }
    }))
    .use(permalinks({
        pattern: ":collection/../:title",
        relative: true
    }))

*/

/*
.use(watch({
    pattern: "** /*",
    livereload: false
}))
.build(function (err, files) {
    // console.log(err);
    // console.log(files);
});
*/
