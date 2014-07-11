var formidable = require('formidable'),
	cfg = require('../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	async = require('async'),
	store = require('nodeRaven')(cfg.dbUrl),
	uuid = require('node-uuid');

module.exports.suggestions = function(req,res,next){
	var searchText = req.query.searchText || '';
	var keyword = searchText.split(' ')[0];
	store.suggest('Licenzireba'
		, 'Licenziebi/ByKeywords'
		, keyword
		, 'fullText'
		, function (err, result) {
			if (!err) {
				var model = new Suggestions(result.Suggestions);
				res.render('licenziebi/suggestions', model);
			}
			else
				next(err);
		});
};

module.exports.sia = function (req, res, next) {
	var start = req.query.start || 0;
	var limit = req.query.limit || 12;
	var searchText = req.query.searchText || '';
	var whereClause = buildWhereClause(searchText);
	store.indexQuery('Licenzireba'
		, 'Licenziebi/ByKeywords'
		, whereClause
		, start
		, limit
		, []
		, function (err, result) {
			if (!err) {
				if (!result.docs.length && searchText.length) {
					res.redirect('/licenziebi/suggestions?searchText=' + searchText);
				} else{
					var model = new LicenziebisSia(start
						, limit
						, searchText
						, result.stats.TotalResults
						, result.docs);
					res.render('licenziebi/sia', model);
				}
			} else
				next(err);
		});
};
module.exports.axali = function (req, res) {
	res.render('licenziebi/axali', {
		regionebi: require('../data/regionebi.json'),
		municipalitetebi: require('../data/municipalitetebi.json'),
		resursebi: require('../data/resursebi.json'),
		uoms: require('../data/uoms.json'),
		regulirebisGadamxdeliOptions:['კი','არა'],
		statusebi:['აქტიური','გაუქმებული','შეზღუდული'],
		fartobiUoms:['მ²','კმ²','ჰა'],
		kategoriebi:['a','b','c1','c2','p']
	});
};
module.exports.save = function(req,res){
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, body, files) {
		var filesNew = _.reduce(files,function(memo,val,key){
			var segments = val.name.split('.');
			var ext = segments.length>1 ? segments[1] : '';
			var oldPath = val.path;
			var newFileName = uuid.v1() + '.' + ext;
			var newPath = path.resolve(__dirname + '/../../public/uploads/') + '/' + newFileName;
			memo.push({
				fieldName:key,
				fileName:newFileName,
				oldPath:oldPath,
				newPath:newPath
			});
			return memo;
		},[]);
		async.each(filesNew,function(f,cb){
			fs.rename(f.oldPath
				, f.newPath
				,function(renameError){
					if(!renameError){
						var fname = f.fieldName.split('_')[0];
						if(body[fname]==null)
							body[fname] = [];
						body[fname].push(f.fileName);
						cb();
					}else{
						cb(renameError);
					}
				});
		},function(finalErr){
			if(!finalErr) {
				var entity = JSON.parse(body.model);
				for(var key in body){
					if(key!='model' && body.hasOwnProperty(key))
						entity[key] = body[key];
				}
				console.log('entity:');
				console.log(entity);
				var doc = {};
				for(var k in entity){
					if(entity.hasOwnProperty(k)) {
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
				console.log('doc');
				console.log(doc);
				store.save('Licenzireba'
					,'Licenzia'
					,doc
					,function(dberr,result){
						if(!dberr)
							res.json({success:true,licenziaId:result.Key});
						else
							res.json({success:false,error:dberr})
					});
			}
			else{
				throw finalErr;
			}
		});
	});
};

function buildWhereClause(searchText) {
	if (searchText)
		return searchText.split(' ')
			.map(function (kw) {
				return 'fullText:*' + kw + '*';
			})
			.join(' ');
	else
		return '';
}

function LicenziebisSia(start,limit,searchText,total,docs){
	var baseUrl = '/licenziebi';
	this.searchText = searchText;
	this.pages = generatePages(baseUrl,start,limit,total,searchText);
	this.items = docs.map(function(item){
		return {
			id:item['@metadata']['@id'],
			pid:item.licenziantisMonacemebi.pid,
			dasaxeleba:item.licenziantisMonacemebi.dasaxeleba,
			licenziisNomeri:item.informaciaLicenziisShesaxeb.nomeri,
			brdzanebisNomeri:item.informaciaLicenziisShesaxeb.brdzanebisNomeri,
			regioni:item.informaciaObiektisShesaxeb.regioni,
			statusi:item.informaciaLicenziisShesaxeb.statusi.mnishvneloba,
			edit:baseUrl+item['@metadata']['@id'].replace('Licenzia','')
		};
	});
}

function generatePages(baseUrl, start, limit, total, searchText) {
	var pages = [];
	var pageCount = parseInt(total / limit);
	var delta = total - (pageCount * limit);
	if (delta > 0)
		pageCount++;
	var current = (start / limit);
	for (var i = -10; i < 11; i++) {
		var rel = current + i;
		if (rel < 0 || rel >= pageCount)
			continue;
		var page = {
			number: (rel + 1).toString(),
			active: current == rel,
			link: baseUrl + '?start=' + rel * limit + '&limit=' + limit + (searchText ? '&searchText=' + searchText : '')
		};
		pages.push(page);
	}
	return pages;
}

function Suggestions(values){
	this.baseUrl = '/licenziebi';
	var base = this.baseUrl;
	this.suggestions = values.map(function(v){
		return {
			link: base + '?start=' + '&limit=' + '&searchText=' + v,
			displayText: v
		};
	});
}