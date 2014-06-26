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
	router.get('/templates/:tpl',function(req,res){
		res.render(req.params.tpl
			, {}
			, function(err,html) {
				console.log('html',html);
				res.send(html);
			});
	});
	router.get('/templates/:subdir/:tpl',function(req,res){
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function(err,html) {
				console.log('html',html);
				res.send(html);
			});
	});
	app.use(router);
};