var middleware = require('./middleware'),
	routes = require('./routes'),
	settings = require('./settings'),
	passport = require('./passport'),
	extensions = require('../utils/extensions'),
	errorHandlers = require('./errorHandlers');

module.exports = function(app){
	extensions.init();
	passport.init();
	settings.init(app);
	middleware.init(app);
	routes.init(app);
	errorHandlers.init(app);
};