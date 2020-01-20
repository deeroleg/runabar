const path = require("path");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	externals: {
		'Config': JSON.stringify({
			serverUrl: 'https://deer.runabar-site.makeidea.ru/api/',
			authCookieName: 'sid',
			facebookAppID: '1540678426012735',
			googleClientID: '400480689927-i2lnd47pl342m17tit9n2s9rrs45gna1.apps.googleusercontent.com',
		})
	}
});
