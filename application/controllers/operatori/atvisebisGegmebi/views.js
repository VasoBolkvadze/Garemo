var helpers = require('../../../utils/helpers'),
	user = require('../../../core/user'),
	cfg = require('../../../../config.json'),
	store = require('nodeRaven')(cfg.dbUrl);

module.exports = function (router) {
	router.get('/operatori/atvisebisGegmebi'
		, user.mustBe('operatori')
		, function (req, res, next) {
			store.indexQuery('Licenzireba'
				, 'atvisebisGegmebi/ByLicenziaCreator'
				, 'licenziaCreator:{0}'.format('momxmarebeli/vaso')
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
			store.load('Licenzireba'
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
			store.load('Licenzireba'
				, 'atvisebisGegma/' + req.params.id
				, function (err, doc) {
					if (!err) {
						res.render('operatori/atvisebisGegmebi/detail', {
							id: doc['@metadata']['@id'].replace('atvisebisGegma/', ''),
							doc: doc
						});
					} else
						next(err);
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
			carmodgenisTarigi: new Date(doc['@metadata']['DateCreated']).toHumanString(),
			edit:baseUrl + id.replace('atvisebisGegma','')
		};
	});
}