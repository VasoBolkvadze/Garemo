var helpers = require('../utils/helpers');

module.exports.LicenziebisSia = function (baseUrl, start, limit, searchText, total, docs) {
	this.searchText = searchText;
	this.pages = helpers.generatePages(baseUrl, start, limit, total, searchText);
	this.items = docs.map(function (item) {
		return {
			id: item['@metadata']['@id'],
			pid: item.licenziantisMonacemebi.pid,
			dasaxeleba: item.licenziantisMonacemebi.dasaxeleba,
			licenziisNomeri: item.informaciaLicenziisShesaxeb.nomeri,
			brdzanebisNomeri: item.informaciaLicenziisShesaxeb.brdzanebisNomeri,
			regioni: item.informaciaObiektisShesaxeb.regioni,
			statusi: item.informaciaLicenziisShesaxeb.statusi.mnishvneloba,
			edit: baseUrl + item['@metadata']['@id'].replace('Licenzia', '')
		};
	});
};
module.exports.SuggestionsViewModel = function (entityName, baseUrl, values) {
	this.entityName = entityName;
	this.baseUrl = baseUrl;
	var base = this.baseUrl;
	this.suggestions = values.map(function (v) {
		return {
			link: base + '?start=' + '&limit=' + '&searchText=' + v,
			displayText: v
		};
	});
};