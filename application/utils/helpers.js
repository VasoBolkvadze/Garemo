module.exports.generatePages = function(baseUrl, start, limit, total, searchText) {
	var pages = [];
	var pageCount = parseInt(total / limit);
	var delta = total - (pageCount * limit);
	if (delta > 0)
		pageCount++;
	var current = (start / limit);
	for (var i = -10; i < 11; i++) {
		var rel = current + i;
		if (rel < 0 || rel >= pageCount)
			continue;
		var page = {
			number: (rel + 1).toString(),
			active: current == rel,
			link: baseUrl + '?start=' + rel * limit + '&limit=' + limit + (searchText ? '&searchText=' + searchText : '')
		};
		pages.push(page);
	}
	return pages;
};

module.exports.buildWhereClause = function(searchText) {
	if (searchText)
		return searchText.split(' ')
			.map(function (kw) {
				return 'fullText:*' + kw + '*';
			})
			.join(' ');
	else
		return '';
};

module.exports.SuggestionsModel = function(entityName,baseUrl,values){
	this.entityName = entityName;
	this.baseUrl = baseUrl;
	var base = this.baseUrl;
	this.suggestions = values.map(function(v){
		return {
			link: base + '?start=' + '&limit=' + '&searchText=' + v,
			displayText: v
		};
	});
};

module.exports.makeRandomPwd = function(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};

module.exports.timeSince = function timeSince(date) {

	var seconds = Math.floor((new Date() - date) / 1000);

	var interval = Math.floor(seconds / 31536000);

	if (interval > 1) {
		return "~" + interval + " წლის წინ...";
	}
	interval = Math.floor(seconds / 2592000);
	if (interval > 1) {
		return "~" + interval + " თვის წინ...";
	}
	interval = Math.floor(seconds / 86400);
	if (interval > 1) {
		return "~" + interval + " დღის წინ...";
	}
	interval = Math.floor(seconds / 3600);
	if (interval > 1) {
		return "~" + interval + " საათის წინ...";
	}
	interval = Math.floor(seconds / 60);
	if (interval > 1) {
		return "~" + interval + " წუთის წინ...";
	}
	return "~" + Math.floor(seconds) + " წამის წინ...";
};