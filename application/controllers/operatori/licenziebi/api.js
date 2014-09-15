var formidable = require('formidable'),
	cfg = require('../../../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	helpers = require('../../../utils/helpers'),
	async = require('async'),
	notificator = require('../../../core/notificator'),
	store = require('noderaven')(cfg.db.url),
	uuid = require('node-uuid'),
	user = require('../../../core/user'),
	appSettings = require('../../../utils/appSettings'),
	debug = require('debug')('controllers:operatori:licenziebi');


module.exports = function (router) {
	router.post('/operatori/api/licenziebi/create'
		, user.mustBe('operatori')
		, function (req, res, next) {
			var form = new formidable.IncomingForm();
			form.parse(req, function (err, body, files) {
				var moveFilePOCOs = generateMoveFilePOCOs(files);
				//debug('generated moveFile POCOs', moveFilePOCOs);
				async.each(moveFilePOCOs, function (poco, cb) {
					fs.rename(poco.oldPath
						, poco.newPath
						, function (renameError) {
							if (!renameError) {
								var fieldName = poco.fieldName.split('_')[0];
								if (!fieldName)
									return cb();
								if (body[fieldName] == null)
									body[fieldName] = [];
								body[fieldName].push({
									id: poco.fileId,
									name: poco.fileName,
									type: poco.fileType
								});
								return cb();
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
									setter += '=entity["' + k + '"]'
									eval(setter);
								}
							}
						}
						doc._metadata = {
							creator: req.user.username
						};
						store.save(cfg.db.name
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
									//NOTICE: register-notification: vadis gasvlis shesaxeb
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
		});

	router.post('/operatori/api/licenziebi/:id/update'
		, user.mustBe('operatori')
		, function (req, res, next) {
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
		});

	router.get('/operatori/api/licenziebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'Licenzia/' + req.params.id
				, function (err, doc) {
					if (!err)
						res.json(doc);
					else
						next(err);
				});
		});

	router.get('/operatori/api/licenziebi/getSourceData/forAxaliLicenziaCtrl'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.json({
				success: true,
				data: {
					carmoqmnisSafudzvlebi: require('../../../data/carmoqmnisSafudzvlebi.json'),
					gauqmebisSafudzvlebi: require('../../../data/gauqmebisSafudzvlebi.json'),
					attachmentPropertyNames: require('../../../data/attachmentPropertyNames.json'),
					emptyLicenzia: require('../../../models/licenzia')
				}
			});
		});

	router.get('/operatori/api/licenziebi/getSourceData/forEditLicenziaCtrl'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.json({
				carmoqmnisSafudzvlebi: require('../../../data/carmoqmnisSafudzvlebi.json'),
				gauqmebisSafudzvlebi: require('../../../data/gauqmebisSafudzvlebi.json'),
				attachmentPropertyNames: require('../../../data/attachmentPropertyNames.json')
			});
		});
};

function generateMoveFilePOCOs(attachedFiles) {
	//debug('attached Files', attachedFiles);
	var uploadDirPath = appSettings.getUploadDirectoryPath();
	return _.reduce(attachedFiles, function (memo, attachedFile, key) {
		var segments = attachedFile.name.split('.');
		var ext = segments.length > 1 ? ('.' + segments[segments.length - 1]) : '';
		var oldPath = attachedFile.path;
		var id = uuid.v1() + ext;
		var newPath = uploadDirPath + '/' + id;
		memo.push({
			fieldName: key,
			fileId: id,
			fileName: attachedFile.name,
			fileType: attachedFile.type,
			oldPath: oldPath,
			newPath: newPath
		});
		return memo;
	}, []);
}