var controllers = require('../controllers');

module.exports = function (name) {
	var accessStr = '';
	var segments = name.split('/');
	segments.forEach(function (part) {
		accessStr+=part + '.';
	});
	accessStr = accessStr.substring(0,accessStr.length-1);
	return new ControllerWrapper(controllers.byString(accessStr));
};

function ControllerWrapper(ctrl) {
	var me = this;
	this.ctrl = ctrl;
	this.action = function (name) {
		var segments = name.split('>');
		for (var i = 0; i < segments.length; i++) {
			var sg = segments[i];
			me.ctrl = me.ctrl[sg];
		}
		return me.ctrl;
	};
}