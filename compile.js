var fs = require("fs"), _path = require("path");

var find = /\b_\/\*([\W\w]*?)\*\//g;
var findSpecials = /(["\\])/g;
var findNewlines = /\n/g;
function replace(match, content) {
	return "\"" + content.replace(findSpecials, "\\$1").replace(findNewlines, "\\n") + "\"";
}

var _require = (function() {
	var is_ = /\._\.js$/;
		
	function _require(path) {
		if (is_.test(path)) {
			return compile(path);
		}
		else {
			return require.apply(this, arguments);
		}
	};
	_require.cache = {};

	return _require;
})();

function compile(path, root, props, log) {
	props = props || {};

	if (!root) { root = ""; }
	else { root = root + "/"; }

	path = _path.relative(root, root + path);

	if (path in compile.cache) {
		return compile.cache[path];
	}

	console.log("compiling "+_path.relative(root, root+path));

	var src = (
		fs.readFileSync(root + path, "utf-8").replace(find, replace) +
		"\n\nreturn module.exports;"
	);

	if (compile.log) {
		fs.appendFileSync(
			compile.log,
			"// Compiled " + path + ":\n" +
			src +
			"\n// End of File\n\n"
		);
	}

	if (root) {
		var oldWD = process.cwd();
		process.chdir(root);
	}

	var exports = new Function("require,module,filepath,compiled,_", src)(
		function(path) {
			if (path.indexOf("./") === 0) { path = _path.join(process.cwd(), path); }
			return _require(path);
		},
		{ exports: { } },
		path,
		compile.compiled,
		props
	);

	if (root) {
		process.chdir(oldWD);
	}

	compile.cache[path] = exports;
	compile.compiled.push(exports);

	if (exports === undefined) { console.log(path, "==", exports); }

	return exports;
}
compile.log = null;
compile.cache = {};
compile.compiled = [];

module.exports = compile;
