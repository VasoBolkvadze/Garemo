var formidable = require('formidable'),
	cfg = require('../../config.json'),
	fs = require('fs'),
	path = require('path'),
	_ = require('underscore'),
	async = require('async'),
	store = require('nodeRaven')(cfg.dbUrl),
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
				store.store('Licenzireba'
					,'Licenzia'
					,doc
					,function(storeErr,result){
						if(!storeErr)
							res.json({success:true});
						else
							res.json({success:false,error:storeErr})
					});
			}
			else{
				throw finalErr;
			}
		});
	});
};