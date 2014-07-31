var express = require('express'),
	user = require('../core/user'),
	controller = require('../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/login', controller('authorization').action('views>login'));
	router.post('/login', controller('authorization').action('api>login'));
	router.get('/logout', user.mustBe('authorized'), controller('authorization').action('api>logout'));
	return router;
})();