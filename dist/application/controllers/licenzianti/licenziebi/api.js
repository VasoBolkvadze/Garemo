var user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('noderaven')(cfg.db.url),
	notificator = require('../../../core/notificator'),
	helpers = require('../../../utils/helpers'),
	debug = require('debug')('controllers:licenzianti:licenziebi');

module.exports.declare = function (router) {
	router.post('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
			var doc = req.body;
			doc.licenziisId = 'Licenzia/' + req.params.id;
			doc.statusi = 'მოლოდინში';
			doc._id = 'atvisebisGegma/' + req.params.id;
			store.save(cfg.db.name
				, 'atvisebisGegma'
				, doc
				, function (err, result) {
					if (!err) {
						notificator
							.registerNotification(req.user.username
							, 'instantly'
							, 'ათვისების გეგმა წარდგენილია წარმატებით, <br/> რომელსაც უახლოეს მომავალში განიხილავს ოპერატორი.');
						notificator
							.registerNotification('vaso'
							, 'instantly'
							, ('<a href="/operatori/licenziantebi/angarishebi/{0}">ლიცენზიანტმა</a> წარმოადგინა' +
								' <a href="/operatori/atvisebisGegmebi/{1}">ათვისების გეგმა</a>,' +
								' ლიცენზიისთვის <a href="/operatori/licenziebi/{2}">#{2}</a>')
								.format(req.user.username
								, req.params.id,
								req.params.id));
						res.json({success: true, redirectUrl: '/licenzianti/licenziebi/' + req.params.id});
					}
					else
						res.json({success: false, error: err});
				});
		});
	router.post('/licenzianti/licenziebi/:id/gaaktiureba'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
			var id = 'Licenzia/' + req.params.id;
			var operations = [
				{
					Type: 'Modify',
					Name: 'informaciaLicenziisShesaxeb',
					Nested: [
						{
							Type: 'Modify',
							Name: 'statusi',
							Nested: [
								{
									Type: 'Set',
									Name: 'mnishvneloba',
									Value: 'აქტიური'
								}
							]
						}
					]
				}
			];
			store.patch(cfg.db.name
				, id
				, operations
				, function (err, result) {
					if (!err) {
						notificator
							.registerNotification('vaso'
							, 'instantly'
							, ('<a href="/operatori/licenziantebi/angarishebi/{0}">ლიცენზიანტმა</a> ' +
								'გააქტიურა <a href=""/operatori/licenziebi/{1}"">ლიცენზია </a>')
								.format(req.user.username, req.params.id)
						);
						res.redirect('/licenzianti/licenziebi/' + req.params.id);
					}
					else
						next(err);
				});
		});
};