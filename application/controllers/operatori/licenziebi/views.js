var cfg = require('../../../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	helpers = require('../../../utils/helpers'),
	viewModels = require('../../../viewModels'),
	async = require('async'),
	notificator = require('../../../core/notificator'),
	store = require('noderaven')(cfg.db.url),
	user = require('../../../core/user');

module.exports.declare = function (router) {
	router.get('/operatori/licenziebi'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var start = req.query.start || 0;
			var limit = req.query.limit || 12;
			var searchText = req.query.searchText || '';
			var whereClause = helpers.buildWhereClause(searchText);
			whereClause+= (whereClause.length ? ' AND ' : '') + 'creator:'+req.user.username;
			store.indexQuery(cfg.db.name
				, 'Licenziebi/ByKeywords'
				, whereClause
				, start
				, limit
				, ['-idn']
				, function (err, result) {
					if (err) return next(err);
					if (!result.docs.length && searchText.length)
						return res.redirect('/operatori/licenziebi/suggestions?searchText=' + searchText);
					var model = new viewModels.LicenziebisSia(
						'/operatori/licenziebi'
						, start
						, limit
						, searchText
						, result.stats.TotalResults
						, result.docs);
					res.render('operatori/licenziebi/sia', model);
				});
		});

	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var searchText = req.query.searchText || '';
			var keyword = searchText.split(' ')[0];
			store.suggest(cfg.db.name
				, 'Licenziebi/ByKeywords'
				, keyword
				, 'fullText'
				, function (err, result) {
					if (!err) {
						var model = new viewModels.SuggestionsViewModel('ლიცენზია', '/operatori/licenziebi', result.Suggestions);
						res.render('common/suggestions', model);
					}
					else
						next(err);
				});
		});

	router.get('/operatori/licenziebi/axali'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.render('operatori/licenziebi/axali', {
				regionebi: require('../../../data/regionebi.json'),
				municipalitetebi: require('../../../data/municipalitetebi.json'),
				resursebi: require('../../../data/resursebi.json'),
				uoms: require('../../../data/uoms.json'),
				regulirebisGadamxdeliOptions: require('../../../data/regulirebisGadamxdeliOptions.json'),
				statusebi: require('../../../data/licenziisStatusebi.json'),
				fartobiUoms: require('../../../data/fartobiUoms.json'),
				kategoriebi: require('../../../data/kategoriebi.json')
			});
		});

	router.get('/operatori/licenziebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'Licenzia/' + req.params.id
				, function (err, doc) {
					if(err) return next(err);
					res.render('operatori/licenziebi/detail', {
						doc: doc,
						fieldLabels: require('../../../data/fieldLabels')
					});
				});
		});

	router.get('/operatori/licenziebi/:id/korektireba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.render('operatori/licenziebi/edit', {
				id: req.params.id,
				regionebi: require('../../../data/regionebi.json'),
				municipalitetebi: require('../../../data/municipalitetebi.json'),
				resursebi: require('../../../data/resursebi.json'),
				uoms: require('../../../data/uoms.json'),
				regulirebisGadamxdeliOptions: require('../../../data/regulirebisGadamxdeliOptions.json'),
				statusebi: require('../../../data/licenziisStatusebi.json'),
				fartobiUoms: require('../../../data/fartobiUoms.json'),
				kategoriebi: require('../../../data/kategoriebi.json')
			});
		});
};