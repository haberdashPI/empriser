var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  devtool: 'source-map',
  output: {
    path: path.join(__dirname,'dist'),
    filename: 'index_bundle.js'
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".json", ".jsx"]
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
    rules: [{
      test: /\.less$/,
      use: [{
        loader: "style-loader" // creates style nodes from JS strings
      }, {
        loader: "css-loader" // translates CSS into CommonJS
      }, {
        loader: "less-loader" // compiles Less to CSS
      }]
    }]
  },
  plugins: [new  HtmlWebpackPlugin({
    title: "earhart",      
    template: 'src/index.ejs'
  })]
};
