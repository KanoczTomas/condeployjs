module.exports = function(req, res, next){
	res.apiResponse = {
		status: 'success',
		data: 'list of devices will be here'
	};
	next();

};
