var express = require('express'),
	jade = require('jade'),
	path = require('path'),
	controllers = require('../controllers');

module.exports.init = function(app){
	var router = express.Router();
	router.get('/login', controllers.authorization.views.login);
	router.post('/login', controllers.authorization.api.login);
	router.get('/logout',isLoggedIn, controllers.authorization.api.logout);
	router.get('/',isLoggedIn, controllers.main.views.home);
	router.get('/admin/licenziebi',isAdmin, controllers.licenziebi.sia);
	router.get('/admin/licenziebi/suggestions',isAdmin, controllers.licenziebi.suggestions);
	router.get('/admin/licenziebi/axali',isAdmin,controllers.licenziebi.axali);
	router.post('/admin/licenziebi/axali',isAdmin,controllers.licenziebi.save);
	router.get('/templates/:subdir/:tpl',function(req,res){
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function(err,html) {
				res.send(html);
			});
	});
	app.use(router);
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()){
		res.locals.user = req.user;
		return next();
	}
	res.redirect('/login');
}
function isAdmin(req,res,next){
	if (req.isAuthenticated() && req.user.role == 'admin'){
		res.locals.user = req.user;
		return next();
	}
	res.redirect('/login');
}