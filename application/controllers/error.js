module.exports.declare = function(router) {
	router.get('/error', function(req,res){
		var error = req.flash('error');
		res.render('customError',{
			message: error.message,
			stack: error.stack,
			status: error.status || 500
		});
	});
};