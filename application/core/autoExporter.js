var fs = require('fs'),
	debug = require('debug')('autoExporter');

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
				var dirnameSegments = dirname.split('/');
				if (dirname != rootdir)
					parts.push(dirnameSegments[dirnameSegments.length - 1]);
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
				debug('evaluating:',moduleExportsString + '=' + requireString);
				eval(moduleExportsString + '=' + requireString);
			} else if (stats.isDirectory(blob)) {
				me.doWork(dirname + '/' + blob);
			}
		}
	}
};