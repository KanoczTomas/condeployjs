var express = require("express");
var app = express();
var config = require("./config");
var morgan = require("morgan");

app.listen(config.port);
app.use(morgan("dev"));
console.log("server running on port " + config.port);

app.get('/',express.static(__dirname + '/static'));