module.exports.init = function (app) {
	var routers = require('../routers');
	app.use(routers.main);
	app.use(routers.authorization);
	app.use(routers.operatori.licenziebi);
	app.use(routers.operatori.licenziantebi);
	app.use(routers.licenzianti.licenziebi);
	app.use(routers.tests.notifications);
	app.use(routers.services.templates);
};