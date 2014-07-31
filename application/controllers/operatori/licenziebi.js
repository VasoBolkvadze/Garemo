var formidable = require('formidable'),
	cfg = require('../../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	helpers = require('../../utils/helpers'),
	viewModels = require('../../viewModels'),
	async = require('async'),
	notificator = require('../../notificator/index'),
	store = require('nodeRaven')(cfg.dbUrl),
	uuid = require('node-uuid');

module.exports.views = {
	sia: function (req, res, next) {
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
	},
	suggestions: function (req, res, next) {
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
	},
	axali: function (req, res, next) {
		res.render('operatori/licenziebi/axali', {
			regionebi: require('../../data/regionebi.json'),
			municipalitetebi: require('../../data/municipalitetebi.json'),
			resursebi: require('../../data/resursebi.json'),
			uoms: require('../../data/uoms.json'),
			regulirebisGadamxdeliOptions: require('../../data/regulirebisGadamxdeliOptions.json'),
			statusebi: require('../../data/licenziisStatusebi.json'),
			fartobiUoms: require('../../data/fartobiUoms.json'),
			kategoriebi: require('../../data/kategoriebi.json')
		});
	},
	detail: function (req, res, next) {
		store.load('Licenzireba'
			, 'Licenzia/' + req.params.id
			, function (err, doc) {
				if (!err)
					res.render('operatori/licenziebi/detail', {
						doc: doc,
						fieldLabels: require('../../data/fieldLabels')
					});
				else
					next(err);
			});
	},
	edit: function (req, res, next) {
		res.render('operatori/licenziebi/edit', {
			id: req.params.id,
			regionebi: require('../../data/regionebi.json'),
			municipalitetebi: require('../../data/municipalitetebi.json'),
			resursebi: require('../../data/resursebi.json'),
			uoms: require('../../data/uoms.json'),
			regulirebisGadamxdeliOptions: require('../../data/regulirebisGadamxdeliOptions.json'),
			statusebi: require('../../data/licenziisStatusebi.json'),
			fartobiUoms: require('../../data/fartobiUoms.json'),
			kategoriebi: require('../../data/kategoriebi.json')
		});
	}
};

var debug = require('debug')('controllers:operatori:licenziebi');

module.exports.api = {
	get: {
		licenzia: {
			byId: function (req, res, next) {
				store.load('Licenzireba'
					, 'Licenzia/' + req.params.id
					, function (err, doc) {
						if (!err)
							res.json(doc);
						else
							next(err);
					});
			}
		},
		sourceData:{
			forAxaliLicenziaCtrl: function (req, res, next) {
				res.json({
					success:true,
					data:{
						carmoqmnisSafudzvlebi: require('../../data/carmoqmnisSafudzvlebi.json'),
						gauqmebisSafudzvlebi: require('../../data/gauqmebisSafudzvlebi.json'),
						attachmentPropertyNames: require('../../data/attachmentPropertyNames.json'),
						emptyLicenzia:require('../../models/licenzia')
					}
				});
			},
			forEditLicenziaCtrl: function (req, res, next) {
				res.json({
					success:true,
					data:{
						carmoqmnisSafudzvlebi: require('../../data/carmoqmnisSafudzvlebi.json'),
						gauqmebisSafudzvlebi: require('../../data/gauqmebisSafudzvlebi.json'),
						attachmentPropertyNames: require('../../data/attachmentPropertyNames.json')
					}
				});
			}
		}
	},
	create: {
		licenzia: function (req, res, next) {
			var form = new formidable.IncomingForm();
			form.parse(req, function (err, body, files) {
				var filesNew = _.reduce(files, function (memo, val, key) {
					var segments = val.name.split('.');
					var ext = segments.length > 1 ? segments[1] : '';
					var oldPath = val.path;
					var newFileName = uuid.v1() + '.' + ext;
					var newPath = path.resolve(__dirname + '/../../public/uploads/') + '/' + newFileName;
					memo.push({
						fieldName: key,
						fileName: newFileName,
						oldPath: oldPath,
						newPath: newPath
					});
					return memo;
				}, []);
				async.each(filesNew, function (f, cb) {
					fs.rename(f.oldPath
						, f.newPath
						, function (renameError) {
							if (!renameError) {
								var fname = f.fieldName.split('_')[0];
								if (body[fname] == null)
									body[fname] = [];
								body[fname].push(f.fileName);
								cb();
							} else {
								cb(renameError);
							}
						});
				}, function (finalErr) {
					if (!finalErr) {
						var entity = JSON.parse(body.model);
						for (var key in body) {
							if (key != 'model' && body.hasOwnProperty(key))
								entity[key] = body[key];
						}
						var doc = {};
						for (var k in entity) {
							if (entity.hasOwnProperty(k)) {
								if (k.indexOf('/') == -1) {
									doc[k] = entity[k];
								} else {
									var setter = 'doc';
									k.split('/').forEach(function (part) {
										setter += "['" + part + "']";
									});
									eval(setter + '=entity["' + k + '"]');
								}
							}
						}
						store.save('Licenzireba'
							, 'Licenzia'
							, doc
							, function (dberr, result) {
								if (!dberr) {
									//register notifications
									var licenziisId = result.Key.replace('Licenzia', '');
									notificator
										.registerNotification(req.user.username
										, 'instantly'
										, 'ახალი <a href="/operatori/licenziebi' +
											licenziisId + '">ლიცენზია</a> შეიქმნა წარმატებით.');
									//TODO: register-notification: vadis gasvlis shesaxeb
									if (doc.informaciaLicenziisShesaxeb.statusi.mnishvneloba == 'ახალი') {
										notificator
											.registerNotification(doc.licenziantisMonacemebi.pid
											, 'instantly'
											, 'თქვენ გაქვთ გასააქტიურებელი ახალი <a href="/licenzianti/axaliLicenziebi' +
												licenziisId + '">ლიცენზია</a>');
									}
									res.json({
										success: true,
										licenziisId: result.Key,
										redirectUrl: '/operatori/licenziebi'
									});
								}
								else
									res.json({success: false, error: dberr})
							});
					}
					else {
						next(finalErr);
					}
				});
			});
		}
	},
	update: {
		licenzia: function (req, res, next) {
			var form = new formidable.IncomingForm();
			form.parse(req, function (err, body, files) {
				var filesNew = _.reduce(files, function (memo, val, key) {
					var segments = val.name.split('.');
					var ext = segments.length > 1 ? segments[1] : '';
					var oldPath = val.path;
					var newFileName = uuid.v1() + '.' + ext;
					var newPath = path.resolve(__dirname + '/../../public/uploads/') + '/' + newFileName;
					memo.push({
						fieldName: key,
						fileName: newFileName,
						oldPath: oldPath,
						newPath: newPath
					});
					return memo;
				}, []);
				async.each(filesNew, function (f, cb) {
					fs.rename(f.oldPath
						, f.newPath
						, function (renameError) {
							if (!renameError) {
								var fname = f.fieldName.split('_')[0];
								if (body[fname] == null)
									body[fname] = [];
								body[fname].push(f.fileName);
								cb();
							} else {
								cb(renameError);
							}
						});
				}, function (finalErr) {
					if (!finalErr) {
						var entity = JSON.parse(body.model);
						for (var key in body) {
							if (key != 'model' && body.hasOwnProperty(key))
								entity[key] = body[key];
						}
						var doc = {};
						for (var k in entity) {
							if (entity.hasOwnProperty(k)) {
								if (k.indexOf('/') == -1) {
									doc[k] = entity[k];
								} else {
									var setter = 'doc';
									k.split('/').forEach(function (part) {
										setter += "['" + part + "']";
									});
									eval(setter + '=entity["' + k + '"]');
								}
							}
						}
						debug('update request', doc);
						res.json({success: true, redirectUrl: '/operatori/licenziebi/' + req.params.id});
					}
					else {
						next(finalErr);
					}
				});
			});
		}
	}
};