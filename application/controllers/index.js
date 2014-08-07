var autoExporter = require('../core/autoExporter');

var thisdir = __dirname.replace(/\\/g,"/");
var exporter = new autoExporter.Instance(thisdir);
exporter.doWork(thisdir);

module.exports = exporter.exportedObjects;