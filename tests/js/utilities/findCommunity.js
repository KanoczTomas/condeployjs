var should = require("should");
var findCommunity = require("../../../js/utilities/findCommunity");

const testIP = '127.0.0.1';
const testCommunities = ['jahoda', 'malina', 'secret' ];

describe('findCommunity.js: in case all tests fail, make sure testIP points to a valid snmp enabled device and testCommunities has a working community.\n testIP = ' + testIP + '\n testCommunities = [' + testCommunities + ']', function(){
	it('should return a promise', function(){
		findCommunity(testIP, testCommunities).should.be.a.Promise();
	});
	it('should take 2 arguments 1st of type string, second a non empty list', function(done){
		findCommunity(testIP, testCommunities).should.be.fulfilled().
		then(function(){
			done();
		});
	});
	it('should be rejected when 1st argument not a valid ip', function(done){
		findCommunity('10.10.10.888', testCommunities).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should be rejected if 2nd argument not a list', function(done){
		findCommunity(testIP, 'test').should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done()
		});
	});
	it('should be rejected if 2nd argument is an empty list', function(done){
		findCommunity(testIP, []).should.be.rejected().
		then(function(err){
			err.should.be.Error();
			done();
		});
	});
	it('should return a string once fulfilled', function(done){
		findCommunity(testIP, testCommunities).should.be.fulfilled().
		then(function(out){
			out.should.be.a.String();
			done();
		});
	});
	it('should return the correct community once fulfilled', function(done){
		findCommunity(testIP, testCommunities).should.be.fulfilled().
		then(function(out){
			out.should.be.equal('secret');
			done();
		});
	});
});
