var viewModels = require('../../viewModels'),
	cfg = require('../../../config.json'),
	debug = require('debug')('controllers:licenzianti/licenziebi'),
	store = require('nodeRaven')(cfg.dbUrl),
	notificator = require('../../notificator/index'),
	helpers = require('../../utils/helpers');

module.exports.views = {
	detail: function (req, res, next) {
		store.load('Licenzireba'
			,'atvisebisGegma/'+req.params.id
			, function (err, doc) {
				res.render('operatori/atvisebisGegmebi/detail',doc);
			});
	}
};