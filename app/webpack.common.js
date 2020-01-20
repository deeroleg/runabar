const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: "./src/index.js",
	output: {
		path: path.join(__dirname, "../sources/comps/www/js"),
		filename: "bundle.min.js",
		publicPath: '/js/',
	},
	plugins: [
		new HtmlWebpackPlugin({
			hash: true,
			filename: './../index.html',
			seo: {
				title: 'Runabar',
				description: 'Runabar is virtual community for collaborative solutions'
			},
			template: './index.html',
		})
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			}
		]
	},
};
