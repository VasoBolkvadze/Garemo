var viewModels = require('../../viewModels'),
	cfg = require('../../../config.json'),
	debug = require('debug')('controllers:licenzianti/licenziebi'),
	store = require('nodeRaven')(cfg.dbUrl),
	notificator = require('../../notificator/index'),
	helpers = require('../../utils/helpers');

module.exports.views = {
	sia: function (req, res, next) {
		var start = req.query.start || 0;
		var limit = req.query.limit || 12;
		var searchText = req.query.searchText || '';
		var whereClause = helpers.buildWhereClause(searchText);
		if (whereClause.length)
			whereClause += ' AND';
		whereClause += ' pid:{0} AND statusi:"{1}"'.format(req.user.username, 'აქტიური')
		debug('whereClause:', whereClause);
		store.indexQuery('Licenzireba'
			, 'Licenziebi/ByKeywords'
			, whereClause
			, start
			, limit
			, []
			, function (err, result) {
				debug('query results:', result);
				if (!err) {
					if (!result.docs.length && searchText.length) {
						//TODO: Create Suggestions (route,action) for role/licenzianti.
						res.redirect('/licenzianti/licenziebi/suggestions?searchText=' + searchText);
					} else {
						var model = new viewModels.LicenziebisSia(
							'/licenzianti/licenziebi'
							, start
							, limit
							, searchText
							, result.stats.TotalResults
							, result.docs);
						res.render('licenzianti/licenziebi/sia', model);
					}
				} else
					next(err);
			});
	},
	detail: function (req, res, next) {
		store.load('Licenzireba'
			, 'Licenzia/' + req.params.id
			, function (err, doc) {
				if (!err)
					res.render('licenzianti/licenziebi/detail', {
						doc: doc,
						fieldLabels: require('../../data/fieldLabels')
					});
				else
					next(err);
			});
	},
	atvisebisGegma: function (req, res, next) {
		res.render('licenzianti/licenziebi/atvisebisGegma');
	},
	gaaktiureba: function (req, res, next) {
		var whereClause = 'pid:{0} AND statusi:ახალი'.format(req.user.username);
		store.indexQuery('Licenzireba'
			, 'Licenziebi/ByKeywords'
			, whereClause, 0, 1, []
			, function (err, result) {
				if (!err) {
					var doc = result.docs.length ? result.docs[0] : null;
					res.render('licenzianti/licenziebi/gaaktiureba', {
						documentExists: doc != null,
						doc: doc,
						fieldLabels: require('../../data/fieldLabels')
					});
				} else {
					next(err);
				}
			});
	}
};

module.exports.api = {
	atvisebisGegmisCardgena: function (req, res, next) {
		var doc = req.body;
		doc.licenziisId = 'Licenzia/' + req.params.id;
		doc._id = 'atvisebisGegma/' + req.params.id;
		store.save('Licenzireba'
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
	},
	gaaktiureba: function (req, res, next) {
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
		store.patch('Licenzireba'
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
	}
};