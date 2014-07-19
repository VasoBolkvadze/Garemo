var favicon = require('static-favicon'),
	express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	flash = require('connect-flash'),
	session = require('express-session');

module.exports.init = function(app){
	app.set('views', path.join(__dirname, '../views'));
	app.set('view engine', 'jade');
	app.use(favicon());
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '../../public')));
	app.use(session({ secret: '2140dd85-1ab4-450c-822b-dfc5cf259aaf' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());
};