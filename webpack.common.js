'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
        test: /manifest.json$/,
        use: [
          { loader: 'json-loader' },
          {
            loader: 'file-loader',
            options: {
              name: 'manifest.json' // '!web-app-manifest-loader'
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(html)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true,
            attrs: ['img:src', 'link:href', 'link:href']
          }
        }]
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
        use: ExtractTextPlugin.extract({
          use: ['css-loader?url=false'],
          fallback: 'style-loader'
        })
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
        use: [
          'babel-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: 'favicon.ico'
    }),
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
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
