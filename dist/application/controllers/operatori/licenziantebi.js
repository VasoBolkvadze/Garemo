var user = require('../../core/user'),
	helpers = require('../../utils/helpers'),
	cfg = require('../../../config'),
	fs = require('fs'),
	_ = require('underscore'),
	viewModels = require('../../viewModels'),
	async = require('async'),
	path = require('path'),
	store = require('noderaven')(cfg.db.url);

var viewDir = 'operatori/licenziantebi';
var rootUrl = '/operatori/licenziantebi';
var baseUrl = '/angarishebi';

module.exports.root = rootUrl;
module.exports.declare = function (router) {

	router.get(baseUrl
		, user.mustBe('operatori')
		, function (req, res, next) {
			var start = req.query.start || 0;
			var limit = req.query.limit || 12;
			var searchText = req.query.searchText || '';
			var whereClause = helpers.buildWhereClause(searchText);
			whereClause+= (whereClause.length ? ' AND ' : '') + 'licenziaCreators:'+req.user.username;
			store.indexQuery(cfg.db.name
				, 'Licenziantebi/ByKeywords'
				, whereClause
				, start
				, limit
				, ['dasaxeleba']
				, function (err, result) {
					if (!err) {
						if (!result.docs.length && searchText.length) {
							res.redirect(rootUrl+baseUrl+'/suggestions?searchText=' + searchText);
						} else {
							var model = new AngarishebisSia(rootUrl + baseUrl
								, start
								, limit
								, searchText
								, result.stats.TotalResults
								, result.docs);
							res.render(viewDir + '/angarishebisSia', model);
						}
					} else
						next(err);
				});
		});

	router.get(baseUrl+'/suggestions'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var searchText = req.query.searchText || '';
			var keyword = searchText.split(' ')[0];
			store.suggest(cfg.db.name
				, 'Licenziantebi/ByKeywords'
				, keyword
				, 'fullText'
				, function (err, result) {
					if (!err) {
						var model = new viewModels.SuggestionsViewModel('ლიცენზიანტის ანგარიში'
							, rootUrl + baseUrl
							, result.Suggestions);
						res.render('common/suggestions', model);
					}
					else
						next(err);
				});
		});

	router.get(baseUrl+'/:pid'
		, user.mustBe('operatori')
		, function (req, res, next) {
			getLicenziantiByPid(req.params.pid
				, function (err, doc) {
					if(err) return next(err);
					res.render(viewDir + '/angarishiDetail', doc);
				});
		});

	router.post(baseUrl+'/:pid/generatePassword'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var pid = req.params.pid;
			getLicenziantiByPid(pid
				, function (err, doc) {
					if(err) return next(err);
					var momxmarebeli = {
						_id: 'momxmarebeli/' + pid,
						dasaxeleba: doc.dasaxeleba,
						username: pid,
						password: helpers.makeRandomPwd(),
						roleId:'role/licenzianti'
					};
					store.save(cfg.db.name
						,'momxmarebeli'
						,momxmarebeli
						,function(saveError,saveResult){
							if(saveError) return next(saveError);
							res.redirect(rootUrl + baseUrl + '/' + pid);
						});
				});
		});
};

function getLicenziantiByPid(pid, done) {
	store.indexQuery(cfg.db.name
		, 'Licenziantebi/ByKeywords'
		, 'pid:' + pid
		, 0, 1, []
		, function (err, result) {
			if (!err && result.docs.length > 0)
				done(null, result.docs[0]);
			else
				done(err || new Error('nothing found.'));
		});
}



function AngarishebisSia(url, start, limit, searchText, total, docs) {
	this.searchText = searchText;
	this.pages = helpers.generatePages(url, start, limit, total, searchText);
	this.items = docs.map(function (item) {
		return {
			dasaxeleba: item.dasaxeleba,
			pid: item.pid,
			paroli: item.paroli,
			edit: url + '/' + item.pid
		};
	});
}