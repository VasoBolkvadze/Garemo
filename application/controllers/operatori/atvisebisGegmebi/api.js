var user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	notificator = require('../../../core/notificator'),
	store = require('noderaven')(cfg.db.url);

module.exports.declare = function (router) {
	router.get('/operatori/api/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'atvisebisGegma/' + req.params.id
				, function (err, doc) {
					if(err) return next(err);
					res.json({
						success: true,
						data: doc
					});
				});
		});
	router.post('/operatori/atvisebisGegmebi/:id/damtkiceba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'Licenzia/'+req.params.id
				, function(err1, licenzia){
					var licenziantisUsername = licenzia.licenziantisMonacemebi.pid;
					var id = 'atvisebisGegma/' + req.params.id;
					var operations = [{Type: 'Set',Name: 'statusi',Value: 'დამტკიცებული'}];
					store.patch(cfg.db.name
						, id
						, operations
						, function (err, result) {
							if(err) return next(err);
							notificator
								.registerNotification(licenziantisUsername
								, 'instantly'
								, 'თქვენი წარდგენილი ათვისების გეგმა დამტკიცებულია.');
							res.redirect('/operatori/atvisebisGegmebi');
						});
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