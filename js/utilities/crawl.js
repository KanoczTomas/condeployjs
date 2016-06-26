var snmp = require('snmp-native');
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

var communities = []
communities.push('tr0p1c4lst0rms');
communities.push('mIKA8tqiYn2LbXcT6G3U');
communities.push('summer_N_c0l0rad0');
communities.push('secret');

function Device(ip){ //object Device, if you give it the IP its methods should find its hostname and the working community as well
  this.ip = ip;
  this.hostname = ''; //set by findWorkingCommunity
  this.community = '';
  this.cdpIndexes = []; //indexes for cdp table
  this.session = '';//the snmp session, after the community was found
  this.neighbors = {}; //will contain all the neighbors of this device
}

Device.prototype.findWorkingCommunity = function() { //this method is a promise

  var self = this;
  var sessions = []; //will contain our testing sessions so we can close them later
  
  return new Promise(function (resolve, reject){
    async.some(
      communities, //we will iterate through this array
      function (community, callback){//called upon each array member
        var session = new snmp.Session({host:self.ip, community: community});
        sessions.push(session);
        session.get({oid: oids.hostname}, function (err, vars){
          if(err){
            callback(false);
          }
          else if(vars){
            self.hostname = vars[0].value;
            console.log('found community: '+ community + ' for ' + self.ip + '(' + self.hostname + ')');
            self.community = community;
            callback(true);//by callinig this we jump to the below function right away
          }
        });
      },
      function (found){//is called after all were iterated, or when callback(true) is called
        if(found){
	  resolve();
	}
        else {
	  reject(new Error('No community found for ' + self.ip + ' device'));
	}
	console.log('cleaning up session for ' + self.ip + '\n');
        sessions.forEach(function(sessionToClose){
          sessionToClose.close();
        });
      }
    );
  });

};

Device.prototype.findWorkingCommunity.description = function(){/* 
    This method returns a promise.
    It goes through all the communities using async.some
    async.some take 3 parameters, first is an array 
    sedond is an iterator function - it iterates through the array,
      its first argument is the actual member of the array and callback.
      The callback function has to be explicitly called with true/false as arguments
    third parameter is an optional callback, when the iterator function callback is called
       with true, this function will fire

    So the session.get will be called asynchroniously in background, as soon as one
    of the calls will succeed the iterator callback will be called with (true). After
    that the callback function will be run, resolving/rejecting the promise and finishing
    the sessions. So if a community is found, this will clear the sessions right away, not
    waiting for a timeout for the second snmp.get call, that would otherwise timeout.
*/}.toString().slice(14,-3); //description for the method

var devices = [];
function findCommunities(ips){
	async.each(ips, function (ip, callback){
	  var device = new Device(ip);
	  devices.push(device);
	  device.findWorkingCommunity()
	  .error(function(err){
	    console.error(err);
	  })
	  callback();
	}, function(){
		console.log("returning devices: " + devices);
		return devices;//the module return the result
	});
}

module.exports = findCommunities;
