var express = require('express'),
	jade = require('jade'),
	path = require('path'),
	controllers = require('../controllers');

module.exports.init = function(app){
	var router = express.Router();
	router.get('/',controllers.home.index);
	router.get('/licenziebi',controllers.licenziebi.sia);
	router.get('/licenziebi/axali',controllers.licenziebi.axali);
	router.post('/licenziebi/axali',controllers.licenziebi.save);
	router.get('/templates/:subdir/:tpl',function(req,res){
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function(err,html) {
				res.send(html);
			});
	});
	//--- test ---
	router.get('/test',function(req,res){
		res.render('tests/axali');
	});
	app.use(router);
};