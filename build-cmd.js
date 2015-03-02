var args = process.argv.slice(2);

var config = { root: args[0] };

if (args.length === 5) {
	config.startLiteral = args[1];
	config.endLiteral = args[2];
	args.splice(1, 2);
}
else if (args.length === 4) {
	config.findLiteral = new RegExp(args.splice(1, 1)[0], "g");
}

config.src = args[1] || "";
config.build = args[2] || "";

//console.log(config);
require("./build.v2.js")(config);
