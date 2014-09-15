var user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('noderaven')(cfg.db.url);

module.exports = function (router) {
	router.get('/operatori/api/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
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
			store.patch(cfg.db.name
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
			store.patch(cfg.db.name
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
			store.save(cfg.db.name
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
};