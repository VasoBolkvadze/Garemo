var fs = require('fs'),
	debug = require('debug')('core:autoExporter');

module.exports.Instance = function (rootdir) {
	var me = this;
	var exportedObjects;
	this.exportedObjects = exportedObjects = {};
	this.doWork = function(dirname) {
		var tree = fs.readdirSync(dirname);
		for (var i = 0; i < tree.length; i++) {
			var blob = tree[i];
			var stats = fs.statSync(dirname + '/' + blob);
			if (stats.isFile(blob) && blob != 'index.js') {
				var segments = blob.split('.');
				var extension = segments[segments.length - 1];
				var fileName = segments[0];
				var parts = [];
				var dirnameSegments = dirname.replace(rootdir,'').split('/');
				if (dirname != rootdir){
					dirnameSegments = dirnameSegments.filter(function (part) {
						return part;
					});
					for(var x=0;x<dirnameSegments.length;x++){
						parts.push(dirnameSegments[x]);
					}
				}
				parts.push(fileName);
				var moduleExportsString = 'exportedObjects';
				var requireString = 'require("' + rootdir;
				parts.forEach(function (part) {
					moduleExportsString += '["' + part + '"]';
					if(!eval(moduleExportsString))
						eval(moduleExportsString+'={};');
					requireString += "/" + part;
				});
				requireString += '.' + extension + '");';
				eval(moduleExportsString + '=' + requireString);
			} else if (stats.isDirectory(blob)) {
				me.doWork(dirname + '/' + blob);
			}
		}
	}
};