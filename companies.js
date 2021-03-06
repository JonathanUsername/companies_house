// Collect info from Companies House API

var request_promise = require("request-promise"),
    request = require("request"),
    _ = require("lodash"),
    fs = require("fs"),
    qs = require("querystring"),
    async = require("async"),
    utils = require("./utils"),
    secrets = require("./secrets.private.json"),
    proc = require("child_process"),
    opener = require("opener"),
    calls = require("./calls");


// Exported calls -----------------------------------------------------------------

module.exports = exports = {}
exports.calls = {
    search: search,
    filing_history: filing_history,
    viewdoc: viewdoc,
    show_share_history: show_share_history,
    show_filing_history: show_filing_history,
    show: show // mostly for testing other functions
}

exports.test = function(queries) {
    console.log("Testing...")
    fs.readFile("test.json", function(err, data) {
        done(null, JSON.parse(data.toString()))
    })
}

function show_share_history(query, params) {
    // Usage: params = {"description": "statement-of-capital"}
    // If none, shows all capital figures it can find
    get_company_number(query)
        .then(filing_history)
        .then(done)
    function done(results) {
        // display(results)
        var filtered = findWhere(results.items, params)
        display(filtered)
        var data = filterCapital(filtered)
        fs.readFile("template.html", function(err, template){
            if (err) throw err
            var addendum = "data = " + JSON.stringify(data)
            template = template.toString().replace("DATA_HERE", addendum)
            fs.writeFile("index.html", template, function(err){
                if (err) throw err
                var page = require("path").resolve(__dirname, 'index.html')
                opener(page)
            })
        })
    }
}

function show_filing_history(query, params){
    get_company_number(query, params).then(filing_history).then(display)
}

function display(obj){
    console.log(JSON.stringify(obj, null, 2))
}

function show(call, query){
    exports.calls[call](query).then(function(d){ console.log(d) })
}

// Single calls -----------------------------------------------------------------

function search(query, params) {
    var defaults = {
        items_per_page: 5,
        q: query,
        start_index: 1
    }
    params = _.defaults(params || {}, defaults)
    var opt = {
        url : "https://api.companieshouse.gov.uk/search/companies?" + qs.stringify(params)
    }
    return api_call(opt)
}

function get_company_number(query, params) {
    return search(query).then(firstActiveCompanyNumber)
}

function filing_history(company_number, params) {
    if (!Number.isInteger(parseInt(company_number)))
        throw "Company number, '" + company_number + "', is not integer"
    var defaults = {
        items_per_page: 100,
        start_index: 1
    }
    params = _.defaults(params || {}, defaults)
    var opt = {
            url: "https://api.companieshouse.gov.uk/company/" + company_number + "/filing-history/?" + qs.stringify(params)
        };
    console.log(opt)
    return api_call(opt)
}

function viewdoc(document_id, params) {
    var opt = {
            url: "https://document-api.companieshouse.gov.uk/document/" + document_id + "/content",
            json: false
        };
    var file = fs.createWriteStream("temp.pdf");
    console.log(opt)
    api_call(opt, true).pipe(file).on("close", done)
    function done(results) {
        opener("temp.pdf")
    }
}

function api_call(opt, pipe){
    if (!opt.url) throw "No URL for API call"
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

// function getFigure(item){
//     if (!_.has(item, "description_values.capital.figure"))
//         return
//     var figure = item.description_values.capital.figure
//     if (figure)
//         return figure
//     else if (item.associated_filings)
//         _.map(item.associated_filings, getFigure)
// }


// function getCapital(items, params, get){
//     _.map(findWhere(items, params), function(){})
// }

// Utils  -----------------------------------------------------------------

function findWhere(items, params, get){
    // Usage: findWhere(array, {"description": "statement-of-capital"})
    var arr = _.filter(items, params)
    items.forEach(function(item){
        if (_.has(item, "associated_filings"))
            arr = arr.concat(findWhere(item.associated_filings, params))
    })
    return arr
}

function filterCapital(items){
    return _.filter(items, mapCapital).map(mapCapital)
}

function mapCapital(item){
    var d = item.description_values
    if (d && d.capital)
            return d
    else if (item.associated_filings)
        return _.map(item.associated_filings, mapCapital)[0]
    else 
        return false
}

function firstActiveCompanyNumber(obj){
    return _.filter(obj.items, isActive)[0].company_number 
}

function isActive(item){
    return item.company_status == "active"
}