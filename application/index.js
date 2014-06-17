var express = require('express');
var app = express();
var config = require('./config');

config(app);

module.exports = app;