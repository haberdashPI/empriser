const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
var config = require('./webpack.config')

config.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify('production')
  }
}))

config.plugins.push(new webpack.optimize.UglifyJsPlugin({
  compressor: {
    screw_ie8: true,
    warnings: false
  }
}))

module.exports = config
