// you can use this file to add your custom webpack plugins, loaders and anything you like.
// This is just the basic way to add additional webpack configurations.
// For more information refer the docs: https://storybook.js.org/configurations/custom-webpack-config

// IMPORTANT
// When you add this file, we won't add the default configurations which is similar
// to "React Create App". This only has babel loader to load JavaScript.

module.exports = {
  plugins: [
    // your custom plugins
  ],
  module: {
    rules: [{
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader'],
    }, {
      test: /\.scss$/,
      loaders: ['style-loader', {
        loader: 'css-loader',
        options: {
          modules: true,
        },
      }, 'sass-loader'],
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file-loader',
    }, {
      test: /\.(jpg|png|gif)$/,
      loaders: ['file-loader', 'image-webpack-loader'],
    }],
  },
  resolve: {
    modules: ['app', 'node_modules'],
  }
};
