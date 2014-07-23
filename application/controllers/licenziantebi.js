var helpers = require('../utils/helpers'),
	cfg = require('../../config'),
	fs = require('fs'),
	_ = require('underscore'),
	async = require('async'),
	path = require('path'),
	store = require('nodeRaven')(cfg.dbUrl);

module.exports.views = {
	angarishebisSia: function (req, res, next) {
		var start = req.query.start || 0;
		var limit = req.query.limit || 12;
		var searchText = req.query.searchText || '';
		var whereClause = helpers.buildWhereClause(searchText);
		store.indexQuery('Licenzireba'
			, 'Licenziantebi/ByKeywords'
			, whereClause
			, start
			, limit
			, ['dasaxeleba']
			, function (err, result) {
				if (!err) {
					if (!result.docs.length && searchText.length) {
						res.redirect('/operatori/licenziantebi/angarishebi/suggestions?searchText=' + searchText);
					} else {
						var model = new AngarishebisSia(start
							, limit
							, searchText
							, result.stats.TotalResults
							, result.docs);
						res.render('licenziantebi/angarishebisSia', model);
					}
				} else
					next(err);
			});
	},
	angarishebisSiaSuggestions: function (req, res, next) {
		var searchText = req.query.searchText || '';
		var keyword = searchText.split(' ')[0];
		store.suggest('Licenzireba'
			, 'Licenziantebi/ByKeywords'
			, keyword
			, 'fullText'
			, function (err, result) {
				if (!err) {
					var model = new helpers.SuggestionsModel('ლიცენზიანტის ანგარიში'
						, '/operatori/licenziantebi/angarishebi'
						, result.Suggestions);
					res.render('common/suggestions', model);
				}
				else
					next(err);
			});
	},
	angarishiDetail: function (req, res, next) {
		getLicenziantiByPid(req.params.pid
			, function (err, doc) {
				if (!err)
					res.render('licenziantebi/angarishiDetail', doc);
				else
					next(err);
			});
	}
};

module.exports.api = {
	generatePassword: function (req, res, next) {
		var pid = req.params.pid;
		getLicenziantiByPid(pid
			, function (err, doc) {
				if (!err) {
					var momxmarebeli = {
						_id: 'momxmarebeli/' + pid,
						dasaxeleba: doc.dasaxeleba,
						username: pid,
						password: helpers.makeRandomPwd(),
						roleId:'role/licenzianti'
					};
					store.save('Licenzireba'
						,'momxmarebeli'
						,momxmarebeli
						,function(saveError,saveResult){
							if(!saveError)
								res.redirect('/operatori/licenziantebi/angarishebi/' + pid);
							else
								next(saveError);
						});
				}
				else
					next(err);
			});
	}
};

function getLicenziantiByPid(pid, done) {
	store.indexQuery('Licenzireba'
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

function AngarishebisSia(start, limit, searchText, total, docs) {
	var baseUrl = '/operatori/licenziantebi/angarishebi';
	this.searchText = searchText;
	this.pages = helpers.generatePages(baseUrl, start, limit, total, searchText);
	this.items = docs.map(function (item) {
		return {
			dasaxeleba: item.dasaxeleba,
			pid: item.pid,
			paroli: item.paroli,
			edit: baseUrl + '/' + item.pid
		};
	});
}