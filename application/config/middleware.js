var favicon = require('static-favicon'),
	express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser');

module.exports.init = function(app){
	app.set('views', path.join(__dirname, '../views'));
	app.set('view engine', 'jade');
	app.use(favicon());
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '../../public')));
};