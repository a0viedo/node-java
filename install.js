var os = require("os");
var fs = require("fs");
var path = require("path");

var nodeVersion;
var bindingFile = "nodejavabridge_bindings.node";

if (process.version.indexOf("v0.10") === 0) {
    nodeVersion = "node0.10";
} else if (process.version.indexOf("v0.8") === 0) {
    nodeVersion = "node0.8";
} else {
    console.log("Binary distribution not included. Compiling...");
    return process.exit(1); 
}

var sourceCommonDir = path.join(__dirname, "prebuild", os.platform(), os.arch(), "common");
var sourceDir = path.join(__dirname, "prebuild", os.platform(), os.arch(), nodeVersion);
var source = path.join(sourceDir, bindingFile);

var targetDir = path.join(__dirname, "build", "Release");

console.log("install.js settings:");
console.log("\t", sourceCommonDir);
console.log("\t", sourceDir);
console.log("\t", targetDir);
console.log();

if (!fs.existsSync(source)) {

	console.log(bindingFile + " for platform " + os.platform() + " and arch " + os.arch() + " does not exist");
	return process.exit(1); 
}


var mkdir = function (p, root) {
    "use strict";
    var dirs = p.split(path.sep), dir = dirs.shift(), root = (root||'')+dir+path.sep;

    try { fs.mkdirSync(root); }
    catch (e) {
         //dir was not made, something went wrong
        if(!fs.statSync(root).isDirectory()) throw new Error("couldn't ensure target path " + targetDir, e);
    }
    return !dirs.length||mkdir(dirs.join(path.sep), root);
};


var cp = function(src, dest, cb) {
    "use strict";
    var count = 0;

    var copyFile = function(src, dest, cb) {
        try {
            var reader = fs.createReadStream(src);

            reader.on("end", function () {
                console.log("\t", src, " > ", dest, "> SUCCEED!");
                cb();
            });
            reader.once("error", function (err) {
                console.log("\t", src, " > ", dest, "> FAILED", err);
                cb(err);
            });

            reader.pipe(fs.createWriteStream(dest));   
        } catch (e) {
            console.log("\t", src, " > ", dest, "> FAILED", e);
        }
    };

    var copyRecursive = function(src, dest, cb) {
        var exists = fs.existsSync(src);
        var stats = exists && fs.statSync(src);
        var isDirectory = exists && stats.isDirectory();

        if (isDirectory) {
            if (!fs.existsSync(dest)) fs.mkdirSync(dest);
            fs.readdirSync(src).forEach(function (childItemName) {
                copyRecursive(path.join(src, childItemName),
                    path.join (dest, childItemName), function (err) {
                        if (count===0) cb(err);
                    }
                );
            });
        } else {
            count++;
            copyFile(src, dest, function (err) {
                count--;
                if (count===0 || err) cb(err);
            });
        }
    };

    copyRecursive(src, dest, cb);
};

mkdir(targetDir);

console.log("Copying files from:", sourceCommonDir);

cp(sourceCommonDir, targetDir, function (err) {
    "use strict";
    if (err) { 
        console.log("Error:", err);
        process.exit(1);
    }

    console.log("\nCopying files from:", sourceDir);
    cp(sourceDir, targetDir, function (err){
        "use strict";
        if (err) { 
            console.log("Error:", err);
            process.exit(1);
        }
        process.exit(0);
    });
});

