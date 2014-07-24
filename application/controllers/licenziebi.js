var formidable = require('formidable'),
	cfg = require('../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	helpers = require('../utils/helpers'),
	async = require('async'),
	notificator = require('../notificator'),
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
						var model = new LicenziebisSia(start
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
					var model = new helpers.SuggestionsModel('ლიცენზია', '/operatori/licenziebi', result.Suggestions);
					res.render('common/suggestions', model);
				}
				else
					next(err);
			});
	},
	axali: function (req, res, next) {
		console.log('aqaa');
		res.render('operatori/licenziebi/axali', {
			regionebi: require('../data/regionebi.json'),
			municipalitetebi: require('../data/municipalitetebi.json'),
			resursebi: require('../data/resursebi.json'),
			uoms: require('../data/uoms.json'),
			regulirebisGadamxdeliOptions: require('../data/regulirebisGadamxdeliOptions.json'),
			statusebi: require('../data/licenziisStatusebi.json'),
			fartobiUoms: require('../data/fartobiUoms.json'),
			kategoriebi: require('../data/kategoriebi.json')
		});
	},
	detail: function (req, res, next) {
		store.load('Licenzireba'
			,'Licenzia/'+req.params.id
			,function(err,doc){
				if(!err)
					res.render('operatori/licenziebi/detail', {doc:doc});
				else
					next(err);
			});
	}
};

module.exports.api = {
	save: function (req, res, next) {
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
								if(doc.informaciaLicenziisShesaxeb.statusi.mnishvneloba == 'ახალი'){
									notificator
										.registerNotification(doc.licenziantisMonacemebi.pid
										, 'instantly'
										, 'თქვენ გაქვთ გასააქტიურებელი ახალი <a href="/licenzianti/axaliLicenziebi' +
											licenziisId + '">ლიცენზია</a>');
									//TODO: register-notification: atvisebisGegmis carmodgenis shesaxeb
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
};

// ViewModels
function LicenziebisSia(start, limit, searchText, total, docs) {
	var baseUrl = '/operatori/licenziebi';
	this.searchText = searchText;
	this.pages = helpers.generatePages(baseUrl, start, limit, total, searchText);
	this.items = docs.map(function (item) {
		return {
			id: item['@metadata']['@id'],
			pid: item.licenziantisMonacemebi.pid,
			dasaxeleba: item.licenziantisMonacemebi.dasaxeleba,
			licenziisNomeri: item.informaciaLicenziisShesaxeb.nomeri,
			brdzanebisNomeri: item.informaciaLicenziisShesaxeb.brdzanebisNomeri,
			regioni: item.informaciaObiektisShesaxeb.regioni,
			statusi: item.informaciaLicenziisShesaxeb.statusi.mnishvneloba,
			edit: baseUrl + item['@metadata']['@id'].replace('Licenzia', '')
		};
	});
}

var debug = require('debug')('LicenziebiController');

//function LicenziaDetail(doc){
//	this.id = doc['@metadata']['@id'];
//	this.pid = doc.licenziantisMonacemebi.pid;
//}
//
//var lc = {
//	licenziantisMonacemebi: { dasaxeleba: 'შპს  ,,დავითი“',
//		pid: '211343802',
//		faktMisamarti: 'ქ. თბილისი, მ. კოსტავას ქ. 77',
//		iurMisamarti: 'ქ. თბილისი, მ. კოსტავას ქ. 77',
//		tel: '599 55 09 15',
//		mail: null,
//		mibmuliFailebi: [ 'f7389ea0-08c5-11e4-b548-55f6945a64e3.PDF' ]
//	},
//	carmomadgeneli: { pid: null, saxeli: null, gvari: null, tel: null, mail: null },
//	informaciaObiektisShesaxeb: {
//		resursebi: [
//			[Object]
//		],
//		regioni: 'მცხეთა-მთიანეთი',
//		municipaliteti: 'დუშეთი',
//		dasaxlebuliPunkti: 'სოფ. ჭართალა',
//		fartobiUom: 'ჰა',
//		fartobi: 7.1
//	},
//	informaciaLicenziisShesaxeb: { nomeri: '00040',
//		gacemisTarigi: '2007-02-06',
//		brdzanebisNomeri: '94',
//		brdzanebisTarigi: '2006-02-14',
//		moqmedebisVada: 20,
//		salicenzioPirobebi: '',
//		statusi: { mnishvneloba: 'აქტიური', safudzveli: null },
//		mibmuliFailebi: [
//			'f7389ea1-08c5-11e4-b548-55f6945a64e3.PDF',
//			'f7389ea3-08c5-11e4-b548-55f6945a64e3.PDF',
//			'f7389ea2-08c5-11e4-b548-55f6945a64e3.PDF'
//		]
//	},
//	damatebitiInformacia: { regulirebisGadamxdeli: 'არა',
//		a: { mnishvneloba: null, uom: '' },
//		b: { mnishvneloba: null, uom: '' },
//		c1: { mnishvneloba: null, uom: '' },
//		c2: { mnishvneloba: null, uom: '' },
//		p: { mnishvneloba: 10000, uom: '' },
//		ruqa: [ 'f7389ea4-08c5-11e4-b548-55f6945a64e3.PDF' ],
//		geoSainformacioPaketi: [ 'f7389ea5-08c5-11e4-b548-55f6945a64e3.' ]
//	},
//	carmoqmnisSafudzveli: {
//		title: 'აუქციონი',
//		name: 'auqcioni',
//		aukcionisNomeri: '4',
//		lotisNomeri: '9',
//		ganacxadisNomeri: '4453',
//		sackisiFasi: 12.519,
//		sabolooFasi: 13.771
//	},
//	gauqmebisSafudzveli: { title: 'None', name: 'none' },
//	'@metadata': {
//		'raven-entity-name': 'Licenzia',
//		'raven-last-modified': '2014-07-22T21:19:13.6773177Z',
//		'raven-server-build': '3352',
//		'@id': 'Licenzia/1',
//		etag: '"01000000-0000-0001-0000-000000000001"'
//	}
//};