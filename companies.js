// Collect info from Companies House API

var request_promise = require("request-promise"),
    request = require("request"),
    _ = require("lodash"),
    fs = require("fs"),
    qs = require("querystring"),
    async = require("async"),
    utils = require("./utils"),
    secrets = require("./secrets.private.json"),
    proc = require("child_process");

module.exports = exports = {}
exports.calls = {
	search: search,
    history: history,
    viewdoc: viewdoc
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
    api_call(opt).then(done)
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
    api_call(opt).then(done)
    function done(results) {
        console.log(results)
    }
}

function viewdoc(document_id, params) {
    var opt = {
            url: "https://document-api.companieshouse.gov.uk/document/" + document_id + "/content",
            json: false
        };
    var file = fs.createWriteStream("temp.pdf");
    api_call(opt, true).pipe(file).on("close", done)
    function done(results) {
        proc.execFile("/usr/bin/evince", ["temp.pdf"])
    }
}

function api_call(opt, pipe){
    if (!opt.url) utils.showErr("No URL for API call")
    var defaults = {
            url: opt.url,
            json: true,
            headers: {
                "Authorization": "Basic " + new Buffer(secrets.ch_key + ":").toString("base64")
            }
        };
    var params = _.defaults(opt, defaults)
    if (pipe)
        return request(params)
    else
        return request_promise(params).catch(utils.showErr)
}

function displayTitle(result){
	_.map(result.items, function(data){
		console.log(data.title, data.company_number)
	})
	// console.log(results[i].items[0].title, results.company_number)
}

function parseJson(data, queries) {

}