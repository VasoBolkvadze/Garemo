var express = require('express'),
	user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('nodeRaven')(cfg.dbUrl);

module.exports = (function () {
	var router = express.Router();
	router.get('/operatori/api/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load('Licenzireba'
				, 'atvisebisGegma/' + req.params.id
				, function (err, doc) {
					if (!err) {
						res.json({
							success: true,
							data: doc
						});
					} else
						next(err);
				});
		});
	router.post('/operatori/atvisebisGegmebi/:id/damtkiceba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var id = 'atvisebisGegma/' + req.params.id;
			var operations = [
				{
					Type: 'Set',
					Name: 'statusi',
					Value: 'დამტკიცებული'
				}
			];
			store.patch('Licenzireba'
				, id
				, operations
				, function (err, result) {
					if (!err) {
						res.redirect('/operatori/atvisebisGegmebi');
					}
					else
						next(err);
				});
		});
	router.post('/operatori/atvisebisGegmebi/:id/uarkofa'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var id = 'atvisebisGegma/' + req.params.id;
			var operations = [
				{
					Type: 'Set',
					Name: 'statusi',
					Value: 'უარყოფილი'
				}
			];
			store.patch('Licenzireba'
				, id
				, operations
				, function (err, result) {
					if (!err) {
						res.redirect('/operatori/atvisebisGegmebi');
					}
					else
						next(err);
				});
		});
	router.post('/operatori/atvisebisGegmebi/:id/korektireba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var doc = req.body;
			doc._id = 'atvisebisGegma/' + req.params.id;
			store.save('Licenzireba'
				, 'atvisebisGegma'
				, doc
				, function (err, result) {
					if (!err){
						res.json({
							success:true,
							redirectUrl:'/operatori/atvisebisGegmebi'
						});
					}
					else
						res.json({
							success:false,
							data:JSON.stringify(err)
						});
				});
		});
	return router;
})();