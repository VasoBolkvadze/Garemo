module.exports.init = function (app) {
	var routers = require('../routers');
	app.use(routers.main);
	app.use(routers.authorization);
	app.use(routers.operatori.licenziebi.views);
	app.use(routers.operatori.licenziebi.api);
	app.use(routers.operatori.licenziantebi);
	app.use(routers.operatori.atvisebisGegmebi.views);
	app.use(routers.operatori.atvisebisGegmebi.api);
	app.use(routers.licenzianti.licenziebi.views);
	app.use(routers.licenzianti.licenziebi.api);
	app.use(routers.tests.notifications);
	app.use(routers.services.templates);
};