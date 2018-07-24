const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: path.resolve('src/index.html'),
  filename: './index.html'
});
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: [require.resolve('./polyfills'), './src/index.tsx'],
  output: {
    path: path.resolve('dist'),
    filename: 'bundled.js'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        include: path.resolve('src'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              plugins: ['react-hot-loader/babel']
            }
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '../'
            }
          },
          {
            loader: 'css-loader',
            options: {
              localIdentName: '[name]_[local]_[hash:base64]',
              sourceMap: true,
              minimize: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    htmlWebpackPlugin,
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    })
  ]
};
