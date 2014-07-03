var formidable = require('formidable'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	async = require('async'),
	store = require('nodeRaven')('http://localhost:8080/'),
	uuid = require('node-uuid');

module.exports.sia = function (req, res) {
	res.render('licenziebi/sia');
};
module.exports.axali = function (req, res) {
	res.render('licenziebi/axali', {
		regionebi: require('../data/regionebi.json'),
		municipalitetebi: require('../data/municipalitetebi.json'),
		resursebi: require('../data/resursebi.json'),
		uoms: require('../data/uoms.json'),
		statusebi:['აქტიური','გაუქმებული'],
		fartobiUoms:['მ²','კმ²','ჰა']
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
				var doc = JSON.parse(body.model);
				for(var key in body){
					if(key!='model' && body.hasOwnProperty(key))
						doc[key] = body[key];
				}
				console.log(doc);
				res.end();
			}
			//store.store('Licenzireba'
			//	,'Licenzia'
			//	,body
			//	,function(storeErr,result){
			//		if(!storeErr)
			//			res.redirect('/licenziebi');
			//		else
			//			throw storeErr;
			//	});
			else{
				throw finalErr;
			}
		});
	});
};