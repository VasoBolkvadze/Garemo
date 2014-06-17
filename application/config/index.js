var middleware = require('./middleware'),
	routers = require('./routers'),
	errorHandlers = require('./errorHandlers');

module.exports = function(app){
	middleware.init(app);
	routers.init(app);
	errorHandlers.init(app);
};