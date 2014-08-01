var express = require('express'),
	user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('nodeRaven')(cfg.dbUrl);

module.exports = (function () {
	var router = express.Router();
	router.get('/operatori/atvisebisGegmebi'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.render('operatori/atvisebisGegmebi/sia');
		});

	router.get('/operatori/atvisebisGegmebi/:id/korektireba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.render('operatori/atvisebisGegmebi/edit');
		});

	router.get('/operatori/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load('Licenzireba'
				,'atvisebisGegma/'+req.params.id
				, function (err, doc) {
					res.render('operatori/atvisebisGegmebi/detail',{
						id:doc['@metadata']['@id'].replace('atvisebisGegma/',''),
						doc:doc
					});
				});
		});

	return router;
})();