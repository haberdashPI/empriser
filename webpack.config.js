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
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015','react'],
              plugins: ['transform-object-rest-spread']
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192
          }
        }

      },
      {
        test: /\.(glsl|frag|vert)$/,
        exclude: /node_modules/,
        use: ['glslify-import-loader','raw-loader','glslify-loader']
      }
    ]
  },
  plugins: [new  HtmlWebpackPlugin({
    title: "Empriser",
    template: 'src/index.ejs'
  })]
};
