var apiResponse  = require("../models/apiResponse");

module.exports = ['$scope', '$http', function($scope, $http){
  $scope.request = {};
	$scope.oid = ".1.3.6.1.2.1.1.1.0";
	$scope.ip = "ip";
	$scope.community = "community";
	$scope.request.oid = $scope.oid;
	$scope.request.ip = $scope.ip;
	$scope.snmp = function(){
		var ip = $scope.ip;
		var oid = $scope.oid;
		$scope.out = new apiResponse();
		$http.get("api/v1.0/" + ip + "/" + oid)
		.success(function(res){
		  $scope.out = res;
		});
	}
}];
