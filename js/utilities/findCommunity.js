//returns a promise takes 2 args:
// ip - ip of device
// communities - list of community strings to try out
var snmp = require('snmp-native');
var Promise = require('bluebird');
var async = require('async');
var _ = require("underscore");
var ipValidator = require("ip-address").Address4;

var oids = {
  cdpCacheDeviceId: '.1.3.6.1.4.1.9.9.23.1.2.1.1.6',
  cdpCacheDevicePort: '.1.3.6.1.4.1.9.9.23.1.2.1.1.7',
  cdpCachePlatform: '.1.3.6.1.4.1.9.9.23.1.2.1.1.8',
  cdpCacheAddress: '.1.3.6.1.4.1.9.9.23.1.2.1.1.4',
  hostname: '.1.3.6.1.2.1.1.5.0',
  ifDescription: '.1.3.6.1.2.1.2.2.1.2' //contains interface name of the device queried
};

module.exports = function(ip,communities) { //this method is a promise

  var out = {};
  var sessions = []; //will contain our testing sessions so we can close them later
  
  return new Promise(function (resolve, reject){
		if(!(ip && communities)) return reject(Error('Too few arguments'));
		else{
			if(!(typeof(ip) === 'string' && Array.isArray(communities)))return reject(Error('1st aegument must be a steing, second a non empty array'));
			else{
				if(_.isEqual(communities, [])) return reject(Error('2nd argument must be a non empty list'));
				if(new ipValidator(ip).valid === false) return reject(Error('1st argument nit a valid IP'));
			}
		}


    async.some(
      communities, //we will iterate through this array
      function (community, callback){//called upon each array member
        var session = new snmp.Session({host:ip, community: community});
        sessions.push(session);
        session.get({oid: oids.hostname}, function (err, vars){
          if(err){
            callback(false);
          }
          else if(vars){
            out.hostname = vars[0].value;
            out.community = community;
            callback(true);//by callinig this we jump to the below function right away
          }
        });
      },
      function (found){//is called after all were iterated, or when callback(true) is called
        if(found){
				  resolve(out.community);
				}
        else {
	  			reject(new Error('No community found for ' + ip + ' device'));
				}
				//console.log('cleaning up session for ' + ip + '\n');
        sessions.forEach(function(sessionToClose){
          sessionToClose.close();
        });
      }
    );
  });
};

