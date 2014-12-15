module.exports.declare =  function(router){
	router.get('/operatori/geosainformacioPaketi/axali'
		,function (req, res, next) {
			res.redirect('/operatori/geosainformacioPaketi/tipisArcheva');
		});
	router.get('/operatori/geosainformacioPaketi/tipisArcheva'
		,function  (req,res,next) {
			res.render('geoPaketi/tipisArcheva');
		});
	router.get('/operatori/geosainformacioPaketi/axali/:tipi'
		,function (req, res, next) {
			var data = {
				regionebi: require('../../data/regionebi.json'),
				municipalitetebi: require('../../data/municipalitetebi.json'),
				resursebi: require('../../data/resursebi.json'),
				uoms: require('../../data/uoms.json'),
				regulirebisGadamxdeliOptions: require('../../data/regulirebisGadamxdeliOptions.json'),
				statusebi: require('../../data/licenziisStatusebi.json'),
				fartobiUoms: require('../../data/fartobiUoms.json'),
				kategoriebi: require('../../data/kategoriebi.json')
			};
			var tipi = req.params.tipi;
			if(tipi == 'myari')
				res.render('geoPaketi/myari',data);
			if(tipi == 'ckali')
				res.render('geoPaketi/ckali',data);
		});
	router.post('/operatori/geosainformacioPaketi/axali/:tipi'
		, function (req, res) {
			res.send(200);
		});
};