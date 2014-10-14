var helpers = require('../../../utils/helpers'),
	user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('noderaven')(cfg.db.url);

module.exports.declare = function (router) {
	router.get('/operatori/atvisebisGegmebi'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.indexQuery(cfg.db.name
				, 'atvisebisGegmebi/ByLicenziaCreator'
				, 'licenziaCreator:{0}'.format(req.user.username)
				, 0, 128, ['-dateCreated']
				, function (err, result) {
					if (!err) {
						var model = new Sia('/operatori/atvisebisGegmebi', result.docs);
						res.render('operatori/atvisebisGegmebi/sia', model);
					} else
						next(err);
				});
		});

	router.get('/operatori/atvisebisGegmebi/:id/korektireba'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'atvisebisGegma/' + req.params.id
				, function (err, doc) {
					if (!err) {
						res.render('operatori/atvisebisGegmebi/edit', {
							id: doc['@metadata']['@id'].replace('atvisebisGegma/', '')
						});
					} else
						next(err);
				});
		});

	router.get('/operatori/atvisebisGegmebi/:id'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.load(cfg.db.name
				, 'atvisebisGegma/' + req.params.id
				, function (err, doc) {
					if(err) return next(err);
					res.render('operatori/atvisebisGegmebi/detail', {
						id: doc['@metadata']['@id'].replace('atvisebisGegma/', ''),
						doc: doc
					});
				});
		});
};

function Sia(baseUrl, docs) {
	this.baseUrl = baseUrl;
	this.items = docs.map(function (doc) {
		var id = doc['@metadata']['@id'];
		return {
			id: id,
			licenziisId: doc.licenziisId,
			chanacerebisRaodenoba: doc.chanacerebi.length,
			statusi:doc.statusi,
			carmodgenisTarigi: new Date(doc['@metadata']['DateCreated']).format('dd/MM/yyyy'),
			edit:baseUrl + id.replace('atvisebisGegma','')
		};
	});
}