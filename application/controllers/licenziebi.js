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
			console.log(f);
			fs.rename(f.oldPath
				, f.newPath
				,function(renameError){
					if(!renameError){
						body[f.fieldName] = f.fileName;
						cb();
					}else{
						cb(renameError);
					}
				});
		},function(finalErr){
			if(!finalErr)
				store.store('Licenzireba'
					,'Licenzia'
					,body
					,function(storeErr,result){
						if(!storeErr)
							res.redirect('/licenziebi');
						else
							throw storeErr;
					});
			else{
				throw finalErr;
			}
		});
	});
};