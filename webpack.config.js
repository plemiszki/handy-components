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
        test: /\.jsx$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /(node_modules|bower_components|build)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    'react': 'commonjs react'
  }
};
