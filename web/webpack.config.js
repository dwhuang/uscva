const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './app.js',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  },
  output: {
    path: path.resolve(__dirname, 'public/scripts'),
    filename: 'bundle.js'
  }
};
