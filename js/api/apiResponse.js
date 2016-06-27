function apiResponse(){
	this.version = "1.1";
	this.private = {}; //all variables unaccessible from outside directly are here
	this.status = "in progress";
	this.request = {};
	this.errors = [];
	this.data = {};
}

apiResponse.prototype = {
	constructor: apiResponse,
	set status(newStatus){
		var pattern = /success|failed|(in progress)/
		if(pattern.test(newStatus)) this.private.status = newStatus;
		else throw new Error("invalid API status");
	},
	get status(){
		return this.private.status;
	},
	success: function(){
		this.status = "success";
	},
	failed: function(){
		this.status = "failed";
	}
}

module.exports = new apiResponse();
