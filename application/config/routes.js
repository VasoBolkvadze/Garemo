var express = require('express');
	controllers = require('../controllers');

module.exports.init = function(app){
	var router = express.Router();
	router.get('/',controllers.home.index);
	router.get('/licenziebi',controllers.licenziebi.sia);
	router.get('/licenziebi/axali',controllers.licenziebi.axali);
	app.use(router);
};