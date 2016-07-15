var express = require("express");
var app = express();
var config = require("./config");
var morgan = require("morgan");
var snmp = require("snmp-native");
var bodyParser = require("body-parser");
var apiResponse = require("./js/api/apiResponse");
var extend = require("extend");
var resources = require("./js/api/resources");

app.listen(config.port);
app.use(morgan("dev"));
app.use(bodyParser.json());
console.log("server running on port " + config.port);

app.use('/',express.static(__dirname + '/static'));
app.use('/api', resources);
app.use('/api', function(req, res){
	console.log(apiResponse);
	extend(apiResponse, res.apiResponse);
	console.log(res.apiResponse);
	apiResponse.request = {
		url: req.url,
		params: req.params
	};
	if(apiResponse.status === 'success'){
		res.status(200).json(apiResponse);
	}
	else res.status(404).json(apiResponse);
});

