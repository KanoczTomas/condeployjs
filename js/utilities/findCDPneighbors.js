var snmp = require('snmp-native');
var fs = require('fs');
var events = require('events');
var Promise = require('bluebird');
var async = require('async');
Promise.promisifyAll(snmp);

var oids = {
  cdpCacheDeviceId: '.1.3.6.1.4.1.9.9.23.1.2.1.1.6',
  cdpCacheDevicePort: '.1.3.6.1.4.1.9.9.23.1.2.1.1.7',
  cdpCachePlatform: '.1.3.6.1.4.1.9.9.23.1.2.1.1.8',
  cdpCacheAddress: '.1.3.6.1.4.1.9.9.23.1.2.1.1.4',
  hostname: '.1.3.6.1.2.1.1.5.0',
  ifDescription: '.1.3.6.1.2.1.2.2.1.2' //contains interface name of the device queried
};

findCdpIndexes = function(ip, community){

  var out = {};

  return new  Promise(function(resolve, reject){
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
      resolve(out.cdpIndexes);
			session.close();
    });
  });
  
};

findCdpIndexes.description = function(){/*
    This method returns a promise. It simply goes through
    the cdp table, and findes the last 2 indexes, assigns then
    as an array of indexes to the object, later it can be used
    to directly access the cdp neighbor hostname, ip, interface
    and platform
*/}.toString().slice(14, -3);

getCdpInformation = function(){
  
  var self = this;
  self.output = "";

  return new Promise(function(resolve, reject){
    console.log('neighbors for ' + self.hostname + '\n\n');
    self.output += 'ip(hostname) of device polled,hostname of neighbor,local interface,IP address of neighbor,neighbor platform, neighbor port\n';
    async.each(
      self.cdpIndexes,
      function(index, callback){
        var tmp_oids = [ 
          oids.cdpCacheDeviceId + index, 
          oids.ifDescription + '.' + index.split(".")[1],
          oids.cdpCacheAddress + index,
          oids.cdpCachePlatform + index,
          oids.cdpCacheDevicePort + index
        ];
        self.session.getAll({oids:tmp_oids}, function (err, varbinds){
          if(err) callback(err);
          else{
            //console.log('hostname:' + varbinds[0].value);
            //console.log('interface: ' + varbinds[1].value);
            //var ip = varbinds[2].valueHex.slice(0,8);
	    //ip = parseInt(ip.substr(0,2),16) + '.' + parseInt(ip.substr(2,2),16) + '.' + parseInt(ip.substr(4,2),16) + '.' + parseInt(ip.substr(6,2),16);
	    //console.log('IP address: ' + ip);
            //console.log('platform: ' + varbinds[3].value);
            //console.log('neighbor port: ' + varbinds[4].value);

            self.output += self.ip + '(' + self.hostname + '),';
            self.output += varbinds[0].value + ',';
            self.output += varbinds[1].value  + ',';
            var ip = varbinds[2].valueHex.slice(0,8);
	    ip = parseInt(ip.substr(0,2),16) + '.' + parseInt(ip.substr(2,2),16) + '.' + parseInt(ip.substr(4,2),16) + '.' + parseInt(ip.substr(6,2),16);
	    self.output += ip  + ',';
            self.output += varbinds[3].value  + ',';
            self.output += varbinds[4].value  + '\n';
//	    console.log(self.output);
	    callback();
          }
        });
      },
      function(err){
        if(err) reject(err);
	else resolve();
      }
    );
  });
};

module.exports = {
	findCdpIndexes: findCdpIndexes
}
