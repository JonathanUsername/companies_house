// Handle flags and parameters. Control/config file

var companies = require("./companies.js"),
	args = require("yargs")
		.option('query', {
		    alias: 'q',
		    describe: 'query / search term',
		    demand: true,
		    string: true
		})
		.option('test', {
			alias: 't',
			type: 'boolean'
		})
		.option('call', {
			choices: Object.keys(companies.calls),
			describe: "api call to make",
			demand: true
		})
		.help(["h", "help"])
		.argv;

if (args.test){
	companies.test(args.q)
} else {
	console.log(args.q)
	companies.calls[args.call](args.q, {})
}