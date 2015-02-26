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
			if (!(path in _require.cache)) {
				return _require.cache[path] = compile(path);
			}
			return _require.cache[path];
		}
		else {
			return require.apply(this, arguments);
		}
	};
	_require.cache = {};

	return _require;
})();

function compile(path, root, log) {
	if (!root) { root = ""; }
	else { root = root + "/"; }

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

	var exports = new Function("require,module,filepath", src)(
		function(path) {
			if (path.indexOf("./") === 0) { path = process.cwd() + "\\" + path.substring(2); }
			return _require(path);
		},
		{ exports: { } },
		path
	);

	if (root) {
		process.chdir(oldWD);
	}

	return exports;
}
compile.log = null;

module.exports = compile;
