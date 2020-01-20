const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require('terser-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
	performance: {
		maxEntrypointSize: 1572864,
		maxAssetSize: 1572864
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				extractComments: true,
			})
		]
	},
	externals: {
		'Config': JSON.stringify({
			serverUrl: 'https://runabar.com/api/',
			authCookieName: 'sid',
			facebookAppID: '359507438061863',
			googleClientID: '403257954253-v6cqkou8uqu6faq5n0gojsvmtmih8oja.apps.googleusercontent.com',
		})
	}
});
