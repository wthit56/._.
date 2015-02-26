var fs = require("fs"), path = require("path");

var compile = require("./compile.js");

function ensureFilepath(root, filepath) {
	filepath = path.normalize(filepath);
	var sofar = root;
	path.dirname(filepath).split(path.sep).forEach(function(dir) {
		var dirpath = path.join(sofar, dir);
		sofar = sofar ? sofar + path.sep + dir : dir;

		if (!fs.existsSync(dirpath) || !fs.statSync(dirpath).isDirectory()) {
			console.log("creating "+dirpath);
			fs.mkdir(dirpath);
		}
	});
}

function build(src, build, log, overwriteLog) {
	if (log) {
		var logDest = path.join(src, "-compiled.js");
		if (overwriteLog || !fs.existsSync(logDest)) {
			console.log("compiled code will be logged");
			compile.log = path.resolve(src, "-compiled.js");
			fs.writeFileSync(logDest, "");
		}
		else {
			console.log("compiled code will NOT be logged; "+logDest+" would be overwritten.");
		}
	}

	if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
		throw "Specified src path does not exist, or is not a folder: "+path.resolve(src);
	}
	if (!fs.existsSync(build) || !fs.statSync(src).isDirectory()) {
		throw "Specified build path does not exist, or is not a folder: "+path.resolve(build);
	}

	buildPath(src, "", build);

	compile.log = null;
}

var is_ = /._.js$/;
function buildPath(src, _path, build) {
	fs.readdirSync(path.join(src, _path)).forEach(function(filename) {
		var filepath = path.join(_path, filename);
		if (filename[0] !== "-") {
			if (fs.statSync(path.join(src, filepath)).isDirectory()) {
				buildPath(src, filepath, build);
			}
			else if (is_.test(filename)) {
				buildFile(src, filepath, build);
			}
			else {
				console.log("copying "+filepath);
				fs.writeFileSync(
					path.join(build, filepath),
					fs.readFileSync(path.join(src, filepath))
				);
			}
		}
	});
}

function buildFile(srcRoot, src, buildRoot) {
	var built = src.substring(0, src.length - 5);
	ensureFilepath(buildRoot, built);
	var data = compile(src, srcRoot);

	fs.writeFileSync(path.join(buildRoot, built), data);
}

module.exports = build;
