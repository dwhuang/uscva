const path = require('path');

const config = {
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

  target: 'web',

  output: {
    path: path.resolve(__dirname, 'public/scripts'),
    filename: 'uscva.js'
  }
};

module.exports = config;
