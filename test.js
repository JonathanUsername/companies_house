var _ = require("lodash"), json = require("./test.json");

console.log(_.filter(json.items, getCapital).map(getCapital))

function fn(item){
	// console.log(item)
	// console.log(_.find(item, "capital"))
	var c = getCapital(item), arr = [];
	if (c){
		console.log("ITEM:", c)
		return c
	} else {
		return
	}
	// if (_.includes(item.description_values, "capital"))
	// 	console.log(item.description_values.capital.figure)
	// else if (item.)
}

function getCapital(item){
	var d = item.description_values
	if (d && d.capital)
			return d
	else if (item.associated_filings)
		return _.map(item.associated_filings, getCapital)[0]
	else 
		return false
}