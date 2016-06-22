var express = require("express");
var app = express();
var config = require("./config");
var morgan = require("morgan");
var snmp = require("snmp-native");
var bodyParser = require("body-parser");
var apiResponse = require("./js/models/apiResponse");

app.listen(config.port);
app.use(morgan("dev"));
app.use(bodyParser.json());
console.log("server running on port " + config.port);

app.use('/',express.static(__dirname + '/static'));

app.get('/api/v1.0/:ip/:oid', function(req, res){
	var ip = req.params.ip;
	var oid  = req.params.oid;
	var response = new apiResponse();
	try {
		var session = new snmp.Session({host: ip, community: "secret"});
	}
	catch(err){
		response.errors.push(err.message);
		response.status = "snmp session error";
	}
	try{
	session.get({oid: oid}, function(error, varbinds){
		if(error){
			response.errors.push(error.message);
			response.status = "snmp get value error";
		}
		else{
			response.status = "success";
			response.data = varbinds;
		}
		res.json(response);
	});
	}
	catch(err) {
		response.status = "snmp get error";
		response.errors.push(err.message);
		res.json(response);
	}
});
