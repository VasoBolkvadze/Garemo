var user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('nodeRaven')(cfg.dbUrl),
	notificator = require('../../../core/notificator'),
	viewModels = require('../../../viewModels'),
	helpers = require('../../../utils/helpers'),
	debug = require('debug')('controllers:licenzianti:licenziebi');

module.exports = function (router) {
	router.get('/licenzianti/licenziebi'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
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
							//NOTICE: Create Suggestions (route,action) for role/licenzianti.
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
		});
	router.get('/licenzianti/licenziebi/gaaktiureba'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
			var query = 'pid:{0} AND statusi:ახალი'.format(req.user.username);
			store.indexQuery('Licenzireba'
				, 'Licenziebi/ByKeywords'
				, query, 0, 1, []
				, function (err, result) {
					if (!err) {
						var doc = result.docs.length ? result.docs[0] : null;
						res.render('licenzianti/licenziebi/gaaktiureba', {
							documentExists: doc != null,
							doc: doc,
							fieldLabels: require('../../../data/fieldLabels')
						});
					} else {
						next(err);
					}
				});
		});
	router.get('/licenzianti/licenziebi/:id'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
			store.load('Licenzireba'
				, 'Licenzia/' + req.params.id
				, function (err, doc) {
					if (!err)
						res.render('licenzianti/licenziebi/detail', {
							doc: doc,
							fieldLabels: require('../../../data/fieldLabels')
						});
					else
						next(err);
				});
		});
	router.get('/licenzianti/licenziebi/:id/atvisebisGegma'
		, user.mustBe('licenzianti')
		, function (req, res, next) {
			res.render('licenzianti/licenziebi/atvisebisGegma');
		});
};