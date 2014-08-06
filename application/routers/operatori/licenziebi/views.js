var express = require('express'),
	cfg = require('../../../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	helpers = require('../../../utils/helpers'),
	viewModels = require('../../../viewModels'),
	async = require('async'),
	notificator = require('../../../core/notificator'),
	store = require('nodeRaven')(cfg.dbUrl),
	user = require('../../../core/user');

module.exports = (function () {
	var router = express.Router();

	router.get('/operatori/licenziebi'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var start = req.query.start || 0;
			var limit = req.query.limit || 12;
			var searchText = req.query.searchText || '';
			var whereClause = helpers.buildWhereClause(searchText);
			store.indexQuery('Licenzireba'
				, 'Licenziebi/ByKeywords'
				, whereClause
				, start
				, limit
				, []
				, function (err, result) {
					if (!err) {
						if (!result.docs.length && searchText.length) {
							res.redirect('/operatori/licenziebi/suggestions?searchText=' + searchText);
						} else {
							var model = new viewModels.LicenziebisSia(
								'/operatori/licenziebi'
								, start
								, limit
								, searchText
								, result.stats.TotalResults
								, result.docs);
							res.render('operatori/licenziebi/sia', model);
						}
					} else
						next(err);
				});
		});

	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var searchText = req.query.searchText || '';
			var keyword = searchText.split(' ')[0];
			store.suggest('Licenzireba'
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
			store.load('Licenzireba'
				, 'Licenzia/' + req.params.id
				, function (err, doc) {
					if (!err)
						res.render('operatori/licenziebi/detail', {
							doc: doc,
							fieldLabels: require('../../../data/fieldLabels')
						});
					else
						next(err);
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

	return router;
})();