//returns an object that has 2 properties:
//findCDPindexes(ip, community) - exported only due to tests, not used directly
// ip - ip address
// community - community string
// returns promise which resolves to:
// [
//  cdpIndexes - array of cdp indexes,
//  session - snpm session object
// ]
//getCDPinformation(ip, community)
// ip - ip address
// community - community string
// returns promise which resolves to:
// {
//  hostname: - hostname of neighbor device ,
//  localPort: - local port where the neighbor is connected to,
//  ip: - ip of neighbor,
//  platform: - neighbor platform,
//  remotePort: - port of neighbor device we are connected to 
// }
var Promise = require('bluebird');
var snmp = require('snmp-native');
var async = require('async');
var ipAddress = require("ip-address").Address4;

var oids = {
  cdpCacheDeviceId: '.1.3.6.1.4.1.9.9.23.1.2.1.1.6',
  cdpCacheDevicePort: '.1.3.6.1.4.1.9.9.23.1.2.1.1.7',
  cdpCachePlatform: '.1.3.6.1.4.1.9.9.23.1.2.1.1.8',
  cdpCacheAddress: '.1.3.6.1.4.1.9.9.23.1.2.1.1.4',
  hostname: '.1.3.6.1.2.1.1.5.0',
  ifDescription: '.1.3.6.1.2.1.2.2.1.2' //contains interface name of the device queried
};

findCDPindexes = function(ip, community){ //helper function - exported only to be able to test


  var out = {};

  return new  Promise(function(resolve, reject){
		if(!(ip && community)) return reject(Error('Too few arguments!'));
		if(new ipAddress(ip).valid === false) return reject(Error('IP (' + ip + ') not valid!'));
		if(community === '') return reject(Error('No community given'));
		if(typeof(community) !== 'string') return reject(Error('Community must be a string'));

    var session = new snmp.Session({host:ip, community:community});
		out.cdpIndexes = [];

    session.getSubtree({oid:oids.cdpCacheDeviceId}, function (err, vars){
      if(err) return reject(err);
      vars.forEach(function(entry){
        var tmp = [];
        tmp.push(entry.oid.pop());
        tmp.push(entry.oid.pop());
        tmp.reverse();
        out.cdpIndexes.push("." + tmp.toString().replace(",","."));//as stringyfiying an array [1 , 3] returns "1,3" we need to change the "," to "."
      });
			out.session = session;
      resolve(out);//we return an object with the sessiin and indexes
			//session.close();
    });
  });
  
};

findCDPindexes.description = function(){/*
    This method returns a promise. It simply goes through
    the cdp table, and findes the last 2 indexes, assigns then
    as an array of indexes to the object, later it can be used
    to directly access the cdp neighbor hostname, ip, interface
    and platform
*/}.toString().slice(14, -3);

getCDPinformation = function(ip, community){


  return new Promise(function(resolve, reject){

		if(!(ip && community)) return reject(Error('Too few arguments!'));
		if(new ipAddress(ip).valid === false) return reject(Error('IP (' + ip + ') not valid!'));
		if(community === '') return reject(Error('No community given'));
		if(typeof(community) !== 'string') return reject(Error('Community must be a string'));

		findCDPindexes(ip, community).
		then(function(obj){
			var cdpIndexes = obj.cdpIndexes;
			var session = obj.session;
			var output = [];
      async.each(
        cdpIndexes,
        function(index, callback){
          var tmp_oids = [ 
            oids.cdpCacheDeviceId + index, 
            oids.ifDescription + '.' + index.split(".")[1],
            oids.cdpCacheAddress + index,
            oids.cdpCachePlatform + index,
            oids.cdpCacheDevicePort + index
          ];
          session.getAll({oids:tmp_oids}, function (err, varbinds){
            if(err) callback(err);
            else{
							var device = {};
							device.hostname = varbinds[0].value;
							device.localPort = varbinds[1].value;
							device.ip = ipAddress.fromHex(varbinds[2].valueHex).address;
							device.platform = varbinds[3].value;
							device.remotePort = varbinds[4].value;
							output.push(device);
	      			callback();
            }
          });
        },
        function(err){
          if(err) return reject(err);
	  			else resolve(output);
        }
      );
    });
	});
};

module.exports = {
	findCDPindexes: findCDPindexes,
	getCDPinformation: getCDPinformation
}
