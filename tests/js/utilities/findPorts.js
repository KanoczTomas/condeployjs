var should = require("should");
var findPorts = require("../../../js/utilities/findPorts");
var _ = require("underscore");

var testIP = '127.0.0.1';
var testCommunity = 'secret';

describe('findPorts.js: in case tests are failing please make sure you have testIP and testCommunity variables set to a snmp host that is reachable!', function(){
	it('should return a promise', function(){
		findPorts(testIP,testCommunity).should.be.a.Promise();
	});
	it('should have a fulfilled promise value of type list',function(done){
		findPorts(testIP,testCommunity).should.be.a.Promise().and.be.fulfilled()
		.then(function(out){
			out.should.be.Array();
			done();
		});
	});
	it('should take  at least 2 arguments',function(done){
		findPorts(testIP).should.be.rejected().
		then(function(err){
			err.should.be.Error()
			done();
		});
	});
	it('should validate IP and be rejected if 1st argument not a valid IPv4 address', function(done){
		findPorts('10.10.10.888', testCommunity).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should take at least 2 arguments of type \'string\'',function(done){
		findPorts(testIP,3).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done()
		});
	});
	it('should take 3rd optional argument',function(done){
		findPorts(testIP,testCommunity,{type: 'ether', description: 'vlan'}).should.be.fulfilled().
		then(function(){
			done();
		});
	});
	it('should be rejected if 3rd argument not an object with attributes type or description',function(done){
		findPorts(testIP,testCommunity,{test:'test'}).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should be rejected if 3rd argument type atribute is not a string',function(done){
		findPorts(testIP, testCommunity,{type:3}).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should be rejected if 3rd argument description attribute is not a string',function(done){
		findPorts(testIP, testCommunity, {description: 3}).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should give back only ethernet ports (filter{type : \'ether\'})',function(done){
		var arrayToVerify;
		findPorts(testIP, testCommunity).
		then(function(ports){
			arrayToVerify = ports.filter(function(e){return /ether/.test(e.type)});
			return findPorts(testIP, testCommunity, {type: 'ether'})
		}).
		then(function(ports){
			_.isEqual(arrayToVerify,ports).should.be.true();
			done();
		});
	}).timeout(4000);
	it('should give back only ports named vlan (filter{desription: \'vlan\'})',function(done){
		var arrayToVerify;
		findPorts(testIP, testCommunity).
		then(function(ports){
			arrayToVerify = ports.filter(function(e){return /vlan/.test(e.description)});
			return findPorts(testIP, testCommunity, {description: 'vlan'})
		}).
		then(function(ports){
			_.isEqual(arrayToVerify,ports).should.be.true();
			done();
		});
	});
	it('should give back only ports named loop and type software (filter{type: \'software\', description: \'lo\'})',function(done){
		var arrayToVerify;	
		findPorts(testIP, testCommunity).
		then(function(ports){
			arrayToVerify = ports.filter(function(e){
				return /software/.test(e.type) && /lo/.test(e.description)
			});
			return findPorts(testIP, testCommunity, {type: 'software', description: 'lo'});
		}).
		then(function(ports){
			_.isEqual(arrayToVerify,ports).should.be.true();
			done();
		});
	});

});
