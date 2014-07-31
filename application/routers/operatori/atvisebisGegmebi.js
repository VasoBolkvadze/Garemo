var express = require('express'),
	user = require('../../core/user'),
	controller = require('../../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/operatori/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, controller('operatori/atvisebisGegmebi').action('views>detail'));
	return router;
})();