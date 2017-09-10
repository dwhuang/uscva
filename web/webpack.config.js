const path = require('path');
const webpack = require('webpack');

const config = {
  target: 'web',

  context: path.resolve(__dirname, 'src'),

  entry: {
    app: './app.js'
  },

  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ]
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ],

  output: {
    path: path.resolve(__dirname, 'public/scripts'),
    filename: 'uscva.js'
  }
};

module.exports = config;
