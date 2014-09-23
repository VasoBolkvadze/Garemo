var path = require('path');

module.exports = {
	getUploadDirectoryPath: function () {
		return path.resolve(__dirname,'../../public/uploads');
	}
};