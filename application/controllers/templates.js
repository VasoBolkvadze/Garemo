
module.exports.declare = function (router) {
	router.get('/templates/:subdir/:subsubdir/:tpl', function (req, res) {
		res.render(req.params.subdir + '/' + req.params.subsubdir + '/' + req.params.tpl
			, {}
			, function (err, html) {
				res.send(html);
			});
	});
	router.get('/templates/:subdir/:tpl', function (req, res) {
		res.render(req.params.subdir + '/' + req.params.tpl
			, {}
			, function (err, html) {
				res.send(html);
			});
	});
};