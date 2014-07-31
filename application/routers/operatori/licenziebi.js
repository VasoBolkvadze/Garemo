var express = require('express'),
	user = require('../../core/user'),
	controller = require('../../core/controller');

module.exports = (function () {
	var router = express.Router();
	router.get('/operatori/licenziebi'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>sia'));

	router.get('/operatori/licenziebi/suggestions'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>suggestions'));

	router.get('/operatori/licenziebi/axali'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>axali'));

	router.get('/operatori/licenziebi/:id'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>detail'));

	router.get('/operatori/licenziebi/:id/korektireba'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('views>edit'));

	//DataApi
	router.post('/operatori/api/licenziebi/create'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>create>licenzia'));

	router.post('/operatori/api/update/licenzia/:id'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>update>licenzia'));

	router.get('/operatori/api/get/licenzia/:id'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>get>licenzia>byId'));

	router.get('/operatori/api/get/sourceData/forAxaliLicenziaCtrl'
		, user.mustBe('operatori')
		, controller('operatori/licenziebi').action('api>get>sourceData>forAxaliLicenziaCtrl'));

	router.get('/operatori/api/get/sourceData/forEditLicenziaCtrl'
		, user.mustBe('operatori')
		, function (req, res, next) {
			res.json({
				carmoqmnisSafudzvlebi: require('../../data/carmoqmnisSafudzvlebi.json'),
				gauqmebisSafudzvlebi: require('../../data/gauqmebisSafudzvlebi.json'),
				attachmentPropertyNames: require('../../data/attachmentPropertyNames.json')
			});
		});


	return router;
})();