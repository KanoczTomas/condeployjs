//returns a promise takes 3 args:
// ip - ip of device
// community - community string
// filter { - filter object
//   type: 'string',  - regular expression to filter out ports based on type
//	 description: 'string' - regular expression to filter out ports based on description
// }
var snmp = require("snmp-native");
var Promise = require("bluebird");
var ipValidator = require("ip-address").Address4;

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

var interfaces = [];

module.exports = function(ip, community, filter){

	return new Promise(function(resolve, reject){
		if(!(ip && community)) return reject(Error('Too few arguments'));
		else {
			if(!(typeof(ip) === 'string' && typeof(community) === 'string')) 
				return reject(Error('Illegal first 2 arguments, must be of type \'string\''));
			else {
				if(new ipValidator(ip).valid === false){
					return reject(Error('Invalid IP address'));
				}
			}
		}

		var session = new snmp.Session({host: ip, community: community});
		session.getSubtree({oid: oid.ifaceDescription}, function(err, vars){
			if(err) return reject(err);
			vars.forEach(function(ifdescr, index){
				interfaces[index] = {}
				interfaces[index].id = index + 1;
				interfaces[index].description = ifdescr.value;
			});
			session.getSubtree({oid: oid.ifaceType}, function(err, vars){
				if(err) return reject(err);
				vars.forEach(function(iftype, index){
					interfaces[index].type = ifaceTypeCodes[iftype.value * 1];
				});
				session.close();
				if(filter){

					if(Object.keys(filter).find(function(e){return e === 'description' || e === 'type'})){
						for (attr in filter){
							if(!(typeof(filter[attr]) === 'string')) return reject(Error('Filter attribute \'' + attr + '\' not of type \'string\', it is of type \'' + typeof(filter[attr]) +  '\' instead!'));
						}
					}
					else return reject(Error('Invalid filter object, has no attributes type or description'));

					filter.type =  new RegExp(filter.type);
					filter.description =  new RegExp(filter.description);
					var out = interfaces.filter(function(entry){return filter.type.test(entry.type) && filter.description.test(entry.description)});
					resolve(out);
				}
				else resolve(interfaces);
			});
		});
	});
};
