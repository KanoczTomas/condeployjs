var resources = require("express").Router();
var devices = require("./devices");

resources.use('/devices', devices);

module.exports = resources;
