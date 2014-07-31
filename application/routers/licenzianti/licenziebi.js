var express = require('express'),
	user = require('../../core/user'),
	controller = require('../../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/licenzianti/licenziebi'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>sia'));
	router.get('/licenzianti/licenziebi/gaaktiureba'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>gaaktiureba'));
	router.get('/licenzianti/licenziebi/:id'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>detail'));
	router.get('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('views>atvisebisGegma'));
	router.post('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('api>atvisebisGegmisCardgena'));
	router.post('/licenzianti/licenziebi/:id/gaaktiureba'
		, user.mustBe('licenzianti')
		, controller('licenzianti/licenziebi').action('api>gaaktiureba'));
	return router;
})();