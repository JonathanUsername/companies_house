// Handle flags and parameters. Control/config file

var companies = require("./companies.js"),
	utils = require("./utils.js"),
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
		.option('params', {
			describe: "extra api params",
			string: true
		})
		.help(["h", "help"])
		.argv;

if (args.test){
	companies.test(args.q)
} else {
	console.log(args.q)
	var params = utils.tryJson(args.params)
	companies.calls[args.call](args.q, params)
}