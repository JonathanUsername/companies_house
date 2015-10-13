module.exports = exports = {}

exports.showErr = function(e){
	throw e
}

exports.returns = function(obj){
	return obj
}

exports.tryJson = function(str){
	if (!str)
		return {}
	try {
		return JSON.parse(str)
	} catch (e) {
		return str
	}
}