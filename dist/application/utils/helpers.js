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

module.exports.makeRandomPwd = function(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
};