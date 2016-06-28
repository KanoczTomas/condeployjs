var devices = require("express").Router();
var all = require("./all");

devices.get('/', all);

module.exports = devices;
