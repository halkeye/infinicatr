'use strict';
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

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
    publicPath: '/',
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
              minimize: true
            }
          }
        ]
      },
      {
        test: /\.(jpe?g|png|gif|svg|ico)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              hash: 'sha512',
              digest: 'hex',
              name: '[hash].[ext]'
            }
          },
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
                speed: 4
              },
              mozjpeg: {
                progressive: true
              }
            }
          }
        ]
      },
      {
        test: /\.mustache$/,
        use: [
          {
            loader: 'mustache-loader',
            options: {
              minify: true
            }
          }
        ]
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
          options: {
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
    new WebpackManifestPlugin({
      seed: {
        name: 'InfiniCatr',
        short_name: 'InfiniCatr',
        description: 'Endless Supply of cat pictures (as provided by flickr)',
        permissions: [
          'https://*.staticflickr.com/*',
          'https://api.flickr.com/services/rest/'
        ],
        start_url: './index.html',
        display: 'standalone'
      }
    }),
    new FaviconsWebpackPlugin('./icons/icon.svg'),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: 'favicon.ico'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
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
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m'
      }
    }
  }
};
