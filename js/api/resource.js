//the style of code is inspired by rest-interface
var api = require("rest-interface");
var err = require("./errors");
var extend = require("extend");
var route = require("express").Router();

function throwit(type) {
	return function(){
		throw err(
			'Atribute ' + type +
			' must be explicitly set!'
		);
	}
}

var defaults = {
	body: null,
	bodyType: null,
	action: null
};//these attributes have defaults and will not throw

module.exports = function(opts){
	var ret =  extend({
		url: throwit('url'),
		return: throwit('return'),
		method: api({})
	}, defaults, opts);

	function checkMandatoryFields(args){
		args.forEach(function(arg){
			if(typeof(arg) === 'function') arg();
		});
	}
	checkMandatoryFields([ret.url, ret.return]);
	return ret;
}
