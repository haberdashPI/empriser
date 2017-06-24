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
        query: { presets: ['es2015','react'] }
      },
      {
        test: /\.less$/,
        loader: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  plugins: [new  HtmlWebpackPlugin({
    title: "earhart",      
    template: 'src/index.ejs'
  })]
};
