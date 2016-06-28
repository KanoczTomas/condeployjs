var snmp = require("snmp-native");
var Promise = require("bluebird");

var oid = {
	ifaceID: '.1.3.6.1.2.1.2.2.1.1',
	ifaceDescription: '.1.3.6.1.2.1.2.2.1.2',
	ifaceType: '.1.3.6.1.2.1.2.2.1.3'
}

var ifaceTypeCodes = {
	1: "other",          
	2: "regular1822",
	3: "hdh1822",
	4: "ddn-x25",
	5: "rfc877-x25",
	6: "ethernet-csmacd",
	7: "iso88023-csmacd",
	8: "iso88024-tokenBus",
	9: "iso88025-tokenRing",
	10: "iso88026-man",
	11: "starLan",
	12: "proteon-10Mbit",
	13: "proteon-80Mbit",
	14: "hyperchannel",
	15: "fddi",
	16: "lapb",
	17: "sdlc",
	18: "ds1",           
	19: "e1",            
	20: "basicISDN",
	21: "primaryISDN",   
	22: "propPointToPointSerial",
	23: "ppp",
	24: "softwareLoopback",
	25: "eon",            
	26: "ethernet-3Mbit",
	27: "nsip",           
	28: "slip",           
	29: "ultra",          
	30: "ds3",            
	31: "sip",            
	32: "frame-relay"
}

var interfaces = {};

module.exports = function(ip, community){
	return new Promise(function(resolve, reject){
		var session = new snmp.Session({host: ip, community: community});
		session.getSubtree({oid: oid.ifaceDescription}, function(err, vars){
			if(err) reject(err);
			vars.forEach(function(ifdescr, index){
				interfaces[index + 1] = {}
				interfaces[index + 1].description = ifdescr.value;
			});
			session.getSubtree({oid: oid.ifaceType}, function(err, vars){
				if(err) reject(err);
				vars.forEach(function(iftype, index){
					interfaces[index + 1].type = ifaceTypeCodes[iftype.value * 1];
				});
				session.close();
				resolve(interfaces);
			});
		});
	});
};
