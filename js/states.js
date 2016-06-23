module.exports = [ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) { 
    $urlRouterProvider.otherwise("/discover");

    $stateProvider
        .state("discover", {
            url: "/discover",
            templateUrl: "/templates/discover.html"//,
			//controller: require('./controllers/')
        })
        .state("devices", {
            url: "/devices",
            template: "Here will be a list of devices with ports marked as trusted and filtering per model, etc.",
        });
}];