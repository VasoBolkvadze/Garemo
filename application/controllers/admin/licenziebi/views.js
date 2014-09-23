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

var rootUrl = '/admin/licenziebi';
var viewDir = rootUrl.substr(1);
module.exports.root = rootUrl;

module.exports.declare = function (router) {
	router.get('/'
		, user.mustBe('admin')
		, function (req, res, next) {
			var start = req.query.start || 0;
			var limit = req.query.limit || 12;
			var searchText = req.query.searchText || '';
			var whereClause = helpers.buildWhereClause(searchText);
			store.indexQuery(cfg.db.name
				, 'Licenziebi/ByKeywords'
				, whereClause
				, start
				, limit
				, ['-idn']
				, function (err, result) {
					if (err) return next(err);
					if (!result.docs.length && searchText.length)
						return res.redirect(rootUrl + '/suggestions?searchText=' + searchText);
					var model = new viewModels.LicenziebisSia(rootUrl
						, start
						, limit
						, searchText
						, result.stats.TotalResults
						, result.docs);
					res.render(viewDir+'/sia', model);
				});
		});
	router.get('/suggestions'
		, user.mustBe('admin')
		, function (req, res, next) {
			var searchText = req.query.searchText || '';
			var keyword = searchText.split(' ')[0];
			store.suggest(cfg.db.name
				, 'Licenziebi/ByKeywords'
				, keyword
				, 'fullText'
				, function (err, result) {
					if(err) return next(err);
					var model = new viewModels.SuggestionsViewModel('ლიცენზია', rootUrl, result.Suggestions);
					res.render('common/suggestions', model);
				});
		});

	router.get('/:id'
		, user.mustBe('admin')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'Licenzia/' + req.params.id
				, function (err, doc) {
					if(err) return next(err);
					res.render(viewDir + '/detail', {
						doc: doc,
						fieldLabels: require('../../../data/fieldLabels')
					});
				});
		});
};