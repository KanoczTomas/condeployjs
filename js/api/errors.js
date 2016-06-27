module.exports = function(msg){
	var err = Error(msg);
	err.name = 'EmptyMandatoryFieldError';
	return err;
};
