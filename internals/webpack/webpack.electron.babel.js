// Important modules this config uses
const path = require('path');

module.exports = require('./webpack.base.babel')({
  devtool: 'source-map',
  entry: [
    'babel-polyfill',
    path.join(process.cwd(), 'app/main.js'),
  ],

  output: {
    filename: '[name].js',
  },
  plugins: [],
  /**
   * Set target to Electron specific node.js env.
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-main',

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
});
