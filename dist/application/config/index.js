var middleware = require('./middleware'),
	routes = require('./routes'),
	settings = require('./settings'),
	passport = require('./passport'),
	errorHandlers = require('./errorHandlers');

module.exports = function(app){
	passport.init();
	settings.init(app);
	middleware.init(app);
	routes.init(app);
	errorHandlers.init(app);
};