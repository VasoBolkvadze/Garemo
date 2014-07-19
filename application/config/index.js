var middleware = require('./middleware'),
	routes = require('./routes'),
	passport = require('./passport'),
	errorHandlers = require('./errorHandlers');

module.exports = function(app){
	passport.init();
	middleware.init(app);
	routes.init(app);
	errorHandlers.init(app);
};