var express = require('express'),
	user = require('../core/user'),
	controller = require('../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/', user.mustBe('authorized'), controller('main').action('views>home'));
	return router;
})();