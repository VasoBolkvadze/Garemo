var middleware = require('./middleware'),
	routes = require('./routes'),
	errorHandlers = require('./errorHandlers');

module.exports = function(app){
	middleware.init(app);
	routes.init(app);
	errorHandlers.init(app);
};