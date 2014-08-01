var express = require('express'),
	user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('nodeRaven')(cfg.dbUrl);

module.exports = (function () {
	var router = express.Router();
	router.get('temp',function(req,res,next){res.end();});
	return router;
})();