var should = require("should");
//var findCDPneighbors = require("../../../js/utilities/findCDPneighbors");
var _ = require("underscore");

var testIP = '127.0.0.1';
var testCommunity = 'secret';

describe('findCDPneighbors.js: in case tests are failing please make sure you have testIP and testCommunity variables set to a snmp host that is reachable!\n testIP = ' + testIP + '\n testCommunity = ' + testCommunity, function(){
	it('it should return a Promise');
	it('it should be rejected if CDP is not supported');
	it('it should take 2 arguments');
	it('it should be rejected if 1st argument not an IP');
	it('it should be rejected if 2nd argument not a string');
	it('it should be rejected if wrong community supplied');
	it('it should return an object once resolved');
	it('it should close snmp session once finished');

});
