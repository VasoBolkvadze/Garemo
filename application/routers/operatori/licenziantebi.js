var express = require('express'),
	user = require('../../core/user'),
	controller = require('../../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/operatori/licenziantebi/angarishebi'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishebisSia'));

	router.get('/operatori/licenziantebi/angarishebi/suggestions'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishebisSiaSuggestions'));

	router.get('/operatori/licenziantebi/angarishebi/:pid'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('views>angarishiDetail'));

	router.post('/operatori/licenziantebi/angarishebi/:pid/generatePassword'
		, user.mustBe('operatori')
		, controller('operatori/licenziantebi').action('api>generatePassword'));

	return router;
})();