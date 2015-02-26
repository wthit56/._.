var log = process.argv[process.argv.length - 1];
require("./build.js")(process.argv[2], process.argv[3], log.indexOf("-log") === 0, log === "-log!");
