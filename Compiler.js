var findSpecials = /["\\]/g,
	findNewlines = /\n/g;
function replace(match, literal) {
	return "\"" + literal.replace(findSpecials, "\\$&").replace(findNewlines, "\\n") + "\"";
}

var findRegexSpecials = /[[\^$.|?*+()]/g;

function Compiler(config) {
	this.findLiterals = config.findLiteral || new RegExp(
		(
			config.startLiteral
				? config.startLiteral.replace(findRegexSpecials, "\\$&")
				: "/\\*"
		) +
			"([\\W\\w]*?)" +
		(
			config.endLiteral
				? config.endLiteral.replace(findRegexSpecials, "\\$&")
				: "\\*/"
		),
		"g"
	);

	this.setup = config.setup;
	this.teardown = config.teardown;
}
Compiler.prototype = {
	compile: function(string, meta) {
		return new Function(
			"meta,module,require",
			"var exports = module.exports;\n\n" +
			(this.setup ? this.setup + ";\n\n": "") +
			string.replace(this.findLiterals, replace) +
			(this.teardown ? ";\n\n" + this.teardown : "")
		);
	}
};

module.exports = Compiler;