var fs = require('fs');
var debug = require('debug')('controllers:index');

var rootdir = __dirname;

function exportControllers(dirname) {

	var tree = fs.readdirSync(dirname);
	debug('reading directory ' + dirname, tree);
	for (var i = 0; i < tree.length; i++) {
		var blob = tree[i];
		var stats = fs.statSync(dirname + '/' + blob);
		debug(blob + ' is directory ' + stats.isDirectory(blob));
		if (stats.isFile(blob) && blob != 'index.js') {
			var segments = blob.split('.');
			var extension = segments[segments.length - 1];
			var fileName = segments[0];
			var parts = [];
			var dirnameSegments = dirname.split('/');
			if (dirname != rootdir)
				parts.push(dirnameSegments[dirnameSegments.length - 1]);
			parts.push(fileName);
			var moduleExportsString = 'module.exports';
			var requireString = 'require("' + rootdir;
			parts.forEach(function (part) {
				moduleExportsString += '["' + part + '"]';
				if(!eval(moduleExportsString))
					eval(moduleExportsString+'={};');
				requireString += '/' + part;
			});
			requireString += '.' + extension + '");';
			eval(moduleExportsString + '=' + requireString);

		} else if (stats.isDirectory(blob)) {
			exportControllers(dirname + '/' + blob);
		}
	}
}

exportControllers(__dirname);