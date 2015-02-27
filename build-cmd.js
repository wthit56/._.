var args = process.argv;

var log = process.argv[process.argv.length - 1];
var logOverwrite = log === "-log!";
log = log.indexOf("-log") === 0;

var rebuilds = process.argv.slice(3, log ? -2 : process.argv.length - 1);

require("./build.js")(
	args[2],
	rebuilds,
	process.argv[process.argv.length - (log ? 2 : 1)], // build
	log, logOverwrite
);
