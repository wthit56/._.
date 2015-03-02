var fs = require("fs"), path = require("path");
var Compiler = require("./Compiler.js");

var cwd, c;
var compiled;
function compile(filepath, meta) {
	if (filepath in compiled) {
		return compiled[filepath].exports;
	}
	else {
		if (meta == null) { meta = {}; }
		meta.srcpath = filepath;
		meta.buildpath = filepath.replace(_part, "");
		
		var _module = { exports: {} };
		c.compile(fs.readFileSync(filepath, "utf-8"))(meta, _module, _require);

		var exports = _module.exports; _module = null;
		compiled.push(compiled[filepath] = { exports: exports, meta: meta });

		return exports;
	}
}

var isRelative = /^\.\//;
function _require(filepath) {
	if (isRelative.test(filepath)) {
		if (_part.test(filepath)) {
			return compile(filepath);
		}
		else {
			return require(path.join(process.cwd(), filepath));
		}
	}
	else {
		return require(filepath);
	}
}

function build(config) {
	//config.setup = "try{"; config.teardown = "}\ncatch(error) { console.log('Error in \'' + meta.srcpath + '\'.'); throw error; }";

	c = new Compiler(config);
	compiled = [];
	_module = { exports: null };
	
	var cwd = process.cwd();
	if (config.root) { process.chdir(config.root); }

	console.log("Building '" + config.src + "' -> '" + config.build + "'...");

	if (config.src) { process.chdir(config.src); }
	console.log("\nCompiling...");
	compilePath("", config.src !== config.build);
	console.log("...compilation complete.");

	if (toWrite.length) {
		console.log("\nRendering and writing " + toWrite.length + " compiled files...");
		writeFiles(config);
		console.log("...files written.");
	}

	process.chdir(cwd);
	cwd = "";

	if (toCopy.length) {
		console.log("\nCopying " + toCopy.length + " files...");
		copyFiles(config);
		console.log("...files copied.");
	}

	console.log("\n...building complete.");

	toCopy.length = 0;
	_module = null;
	compiled = null;
	c = null;
}

var toWrite = [], toCopy = [];
var isIgnored = /^(?:-|\.git)/, _part = /._.js$/;
function compilePath(dirpath, allowCopy) {
	fs.readdirSync(dirpath).forEach(function readdirSync_iteration(filename, i) {
		var filepath = path.join(dirpath, filename);
		process.stdout.write("- '" + filepath + "' ");

		if (!isIgnored.test(filename)) {
			if (fs.statSync(filepath).isDirectory()) {
				process.stdout.write("scanning directory...\n");
				compilePath(filepath, allowCopy);
				process.stdout.write("  ...scan complete.\n");
				return;
			}
			else if (_part.test(filename)) {
				process.stdout.write("to write.\n");
				toWrite.push(filepath);
				compile(filepath, { srcpath: filepath, buildpath: filepath.replace(_part, ""), compiled: compiled });
				return;
			}
			else if (allowCopy) {
				process.stdout.write("to copy.\n");
				toCopy.push(filepath);
				return;
			}
		}

		process.stdout.write("ignored.\n");
	});
}

function writeFiles(config) {
	while (toWrite.length) {
		var filepath = toWrite.pop();
		var _module = compiled[filepath];
		process.stdout.write("- '" + filepath + "' rendering...\n");
		
		var rendered;
		if (_module.exports instanceof Object) {
			rendered = _module.exports.toString();
			if (typeof rendered !== "string") {
				throw "The compiled module '" + filepath + " has an invalid toString() method defined. A toString method must return a primitive string value.";
			}
		}
		else {
			rendered = _module.exports + "";	
		}

		process.stdout.write("  done. Writing...");
		ensurePath(path.dirname(_module.meta.buildpath), path.join(config.root, config.build));
		fs.writeFileSync(path.join(config.root, config.build, _module.meta.buildpath), rendered);
		process.stdout.write("done.\n");
	}
}

function copyFiles(config) {
	while (toCopy.length) {
		var filepath = toCopy.pop();
		console.log("- '" + filepath + "'.");
		ensurePath(path.dirname(filepath), path.join(config.root, config.build));
		fs.writeFileSync(path.join(config.root || "", config.build, filepath), fs.readFileSync(path.join(config.root || "", config.src, filepath)));
	}
}

function ensurePath(dirpath, root) {
	var dirs = dirpath.split(path.sep), create = false;
	dirpath = root || "";
	for (var i = 0, l = dirs.length; i < l; i++) {
		dirpath = path.join(dirpath, dirs[i]);
		if (!create) {
			if (!fs.existsSync(dirpath)) { create = true; }
			else if (!fs.statSync(dirpath).isDirectory()) {
				throw "Path '" + path.join(process.cwd(), dirpath) + "' exists, but is not a directory.";
			}
		}

		if (create) {
			fs.mkdirSync(dirpath);
		}
	}
}


module.exports = build;
