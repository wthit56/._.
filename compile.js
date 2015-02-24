var fs = require("fs");

var find = /\b_\/\*([\W\w]*?)\*\//g;
var findSpecials = /(["\\])/g;
var findNewlines = /\n/g;
function replace(match, content) {
	return "\"" + content.replace(findSpecials, "\\$1").replace(findNewlines, "\\n") + "\"";
}

var _require = (function() {
	var is_ = /\._\.js$/;
	
	return function _require(path) {
		if (is_.test(path)) {
			return compile(path);
		}
		else {
			return require.apply(this, arguments);
		}
	};
})();

function compile(path, root) {
	if (!root) { root = ""; }
	else { root = "./" + root + "/"; }

	var src = (
		fs.readFileSync(root + path, "utf-8").replace(find, replace) +
		"\n\nreturn module.exports;"
	);

	if (compile.log) {
		fs.appendFileSync(compile.log, "\\"+path+"\n"+ src + "\n\n");
		//fs.appendFileSync(root+compile.log, "\\\\ Compiled "+path+":\n\n"+ src + "\n\n\\\\ End of File\n\n");
	}

	if (root) {
		var oldWD = process.cwd();
		process.chdir(root);
	}

	var exports = new Function("require,module", src)(
		function(path) {
			if (path.indexOf("./") === 0) { path = process.cwd() + "\\" + path.substring(2); }
			return _require(path);
		},
		{ exports: { } }
	);

	if (root) {
		process.chdir(oldWD);
	}

	return exports;
}
compile.log = null;

module.exports = compile;
