var routes = require('../controllers/index'),
	users = require('../controllers/users');

module.exports.init = function(app){
	app.use('/', routes);
	app.use('/users', users);
};