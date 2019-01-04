'use strict';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const path = require('path');

const sourcePath = path.join(__dirname, './app');
const distPath = path.join(__dirname, './dist');

module.exports = {
  devtool: 'source-map',
  context: sourcePath,
  entry: {
    js: 'js/app.js'
  },
  output: {
    path: distPath,
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(html)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: true,
              attrs: ['img:src', 'link:href', 'link:href']
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          {
            loader: 'image-webpack-loader',
            options: {
              gifsicle: {
                interlaced: false
              },
              optipng: {
                optimizationLevel: 7
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              mozjpeg: {
                progressive: true,
                quality: 65
              }
            }
          }
        ]
      },
      {
        test: /\.mustache$/,
        loader: 'mustache-loader?minify'
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?url=false']
      },
      {
        test: /iframe\.html/,
        exclude: /node_modules/,
        use: {
          loader: 'file-loader',
          query: {
            name: '[name].[ext]'
          }
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [path.resolve(__dirname, 'node_modules'), sourcePath]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: 'favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
    }),
    new WebpackPwaManifest({
      name: 'InfiniCatr',
      short_name: 'InfiniCatr',
      description: 'Endless Supply of cat pictures (as provided by flickr)',
      permissions: [
        'https://*.staticflickr.com/*',
        'https://api.flickr.com/services/rest/'
      ],
      icons: [
        {
          src: path.resolve('app/icons/icon.svg'),
          sizes: [32, 60, 90, 120, 128, 144, 152, 25, 512]
        }
      ],
      start_url: './index.html',
      display: 'standalone'
    })
  ],

  stats: {
    colors: {
      green: '\u001b[32m'
    }
  },

  devServer: {
    contentBase: './src',
    historyApiFallback: true,
    port: 3000,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m'
      }
    }
  }
};
