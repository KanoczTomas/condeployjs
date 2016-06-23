var apiResponse  = require("../models/apiResponse");
var extend = require('extend');

module.exports = ['$scope', '$http', function($scope, $http){
	$scope.request = {
		oid : ".1.3.6.1.2.1.1.1.0",
		ip : "ip",
		community : "community"
	};
	$scope.snmp = function(){
		$scope.out = new apiResponse();
		$http.get("api/v1.0/" + $scope.request.ip + "/" + $scope.request.oid)
		.success(function(res){
		  extend($scope.out,res);
		});
	}
}];
