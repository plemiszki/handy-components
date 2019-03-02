const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'handy-components.bundle.js'
  },
  plugins:[
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          { loader: 'babel-loader' }
        ]
      }
    ]
  },
  devtool: 'source-maps',
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
