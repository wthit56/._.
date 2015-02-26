var log = process.argv[process.argv.length - 1];
require("./build.js")(process.argv[0], process.argv[1], !!log, log[log.length - 1] === "!");
