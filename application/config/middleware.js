var favicon = require('static-favicon'),
	express = require('express'),
	path = require('path'),
	logger = require('morgan'),
	cfg = require('../../config.json'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	flash = require('connect-flash'),
	session = require('express-session'),
	debug = require('debug')('config:middleware');

module.exports.init = function (app) {
	app.use(favicon());
	app.use(logger('dev'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded());
	app.use(cookieParser());
	app.use(express.static(path.join(__dirname, '../../public')));
	app.use(session({
		secret: '2140dd85-1ab4-450c-822b-dfc5cf259aaf',
		resave: true,
		saveUninitialized: true
	}));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(flash());

	//authenticate manually if not authenticated
	debug('envMode',cfg.envMode);
	debug('authorization.type',cfg.authorization.type);
	if (cfg.envMode == 'development' && cfg.authorization.type == "manual")
		app.use(function (req, res, next) {
			if (req.isAuthenticated())
				return next();
			var authenticate = passport.authenticate('local-login', {
				successRedirect: cfg.authorization.redirect,
				failureRedirect: '/login',
				failureFlash: true
			});
			req.body.username = 'vaso';
			req.body.password = '1';
			authenticate(req, res, next);
		});

	//set user data on response
	app.use(function (req, res, next) {
		if (req.isAuthenticated()) {
			res.locals.user = req.user;
		}
		next();
	});
};