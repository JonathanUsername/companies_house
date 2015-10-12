// Collect info from Companies House API

var req = require("request-promise"),
    _ = require("lodash"),
    fs = require("fs"),
    qs = require("querystring"),
    async = require("async"),
    utils = require("./utils"),
    secrets = require("./secrets.private.json");

module.exports = exports = {}
exports.calls = {
	search: search,
    history: history
}

exports.test = function(queries) {
    console.log("Testing...")
    fs.readFile("test.json", function(err, data) {
        done(null, JSON.parse(data.toString()))
    })
}

function search(query, params) {
    var defaults = {
        items_per_page: 5,
        q: query,
        start_index: 1
    }
    params = _.defaults(params, defaults)
    var opt = {
        url : "https://api.companieshouse.gov.uk/search/companies?" + qs.stringify(params)
    }
    console.log("1")
    api_call(opt, done)
    function done(results) {
        console.log(results)
        _.map(results, displayTitle)
    }
}

function history(company_number, params) {
    var defaults = {
        items_per_page: 5,
        start_index: 1
    }
    params = _.defaults(params, defaults)
    var opt = {
            url: "https://api.companieshouse.gov.uk/company/" + company_number + "/filing-history/?" + qs.stringify(params)
        };
    console.log(opt)
    api_call(opt, done)
    function done(results) {
        console.log(results)
    }
}

function api_call(opt, next){
    if (!opt.url) utils.showErr("No URL for API call")
    var defaults = {
            url: opt.url,
            json: true,
            headers: {
                "Authorization": "Basic " + new Buffer(secrets.ch_key + ":").toString("base64")
            }
        };
    var params = _.defaults(opt, defaults)
    return req(params).then(next).catch(utils.showErr)
}


function displayTitle(result){
	_.map(result.items, function(data){
		console.log(data.title, data.company_number)
	})
	// console.log(results[i].items[0].title, results.company_number)
}

function parseJson(data, queries) {

}