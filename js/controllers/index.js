require("angular");
var config = require("../../config.js");
var app = angular.module(config.appName);
app.controller("mainCtrl",require("./mainCtrl"));
//module.exports = app;
