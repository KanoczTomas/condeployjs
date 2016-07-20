var should = require("should");
var findCDPneighbors = require("../../../js/utilities/findCDPneighbors");
var findCDPindexes = findCDPneighbors.findCDPindexes;
var getCDPinformation = findCDPneighbors.getCDPinformation;
var _ = require("underscore");
var snmp = require("snmp-native");

var testIP = '10.10.30.2';
var testCommunity = 'secret';
var testObj = {
	hostname: 'R2' ,
	localPort: 'Serial1/0',
	ip: '10.10.12.2',
	platform: 'Cisco 2691',
	remotePort: 'Serial1/0' 
}

describe('findCDPneighbors.js: in case tests are failing please make sure you have testIP and testCommunity variables set to a snmp host that is reachable!\n testIP = ' + testIP + '\n testCommunity = ' + testCommunity + '\n testObj = ' + JSON.stringify(testObj, null, '  '), function(){
	describe('#findCDPindexes(ip,community)',function(){
		it('it should return a Promise', function(){
			findCDPindexes(testIP, testCommunity).should.be.a.Promise();
		});
		it('it should take  at least 2 arguments', function(done){
			findCDPindexes(testIP).should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
			});
			findCDPindexes().should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should be rejected if 1st argument not an IP', function(done){
			findCDPindexes('ip address', 'secret').should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should be rejected if 2nd argument not a string', function(done){
			findCDPindexes(testIP, 3).should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should return a non empty array of indexes and session object as elements of an array when successfull', function(done){
			findCDPindexes(testIP, testCommunity).should.be.fulfilled().
			then(function(out){
				out.should.be.an.Object();
				out.should.have.properties(['cdpIndexes', 'session']);
				out.cdpIndexes.should.be.an.Array();
				_.isEqual(out.cdpIndexes,[]).should.be.false();
				out.session.should.be.instanceof(snmp.Session);
				done();
			});
		});
	});

	describe('#getCDPinformation(ip,community)',function(){
		it('it should return a Promise', function(){
			getCDPinformation(testIP, testCommunity).should.be.a.Promise();
		});
		it('it should take 2 arguments', function(done){
			getCDPinformation().should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
			});
			
			getCDPinformation(3).should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should be rejected if 1st argument not an IP', function(done){
			getCDPinformation('not an ip', 'secret').should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should be rejected if 2nd argument not a string', function(done){
			getCDPinformation(testIP,3).should.be.rejected().
			then(function(err){
				err.should.be.Error();
				console.error(err);
				done();
			});
		});
		it('it should return an array of objects once resolved with 1 entry matching testObj', function(done){
			getCDPinformation(testIP, testCommunity).should.be.fulfilled().
			then(function(out){
				out.should.be.an.Array();
				var tmp = out.filter(function(e){return e.hostname === testObj.hostname && e.ip === testObj.ip})[0];
				_.isEqual(tmp,testObj).should.be.true();
				done();
			});
		});
		it('it should close the snmp session once finished', function(done){
		 var t = getCDPinformation(testIP, testCommunity);
		 t.should.be.fulfilled().
		 then(function(out){
		 	(t.session.socket === undefined).should.be.true();
			done();
		 });
		})
	});
});
