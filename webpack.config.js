var path = require('path');
module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './src/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  externals: {
    'react': 'commonjs react'
  }
};
