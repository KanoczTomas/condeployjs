require("angular")
var config = require("../config")

var app = angular.module(config.appName,
	[]
);
require("./controllers");
