var fs = require('fs'),
	express = require('express'),
	path = require('path');

module.exports.init = function (app) {
	var routeDeclaratorPaths = getFilePaths(path.resolve(__dirname, '../controllers'));
	for (var i = 0; i < routeDeclaratorPaths.length; i++){
		var routeDeclaratorPath = routeDeclaratorPaths[i];
		var routeDeclarator = require(routeDeclaratorPath);
		var router = createRouter(routeDeclarator);
		app.use(routeDeclarator.root || '/', router);
        console.log('using routes declared in "'+routeDeclaratorPath+'"');
	}
};

function createRouter (routeDeclarator,router) {
	var router = express.Router();
	routeDeclarator.declare(router);
	return router;
}

function getFilePaths(dirpath) {
	var results = [];
	var tree = fs.readdirSync(dirpath);
	for (var i = 0; i < tree.length; i++) {
		var blob = tree[i];
		var stats = fs.statSync(dirpath + '/' + blob);
		if (stats.isFile(blob) && blob != 'index.js' && !blob.startsWith('_')) {
			results.push(dirpath + '/' + blob);
		} else if (stats.isDirectory(blob) && !blob.startsWith('_')) {
			results = results.concat(getFilePaths(dirpath + '/' + blob));
		}
	}
	return results;
}