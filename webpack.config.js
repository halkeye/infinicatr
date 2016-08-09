'use strict';
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var autoprefixer = require('autoprefixer-core');

var isDev = process.env.NODE_ENV !== 'production';
var sourceMapParam = isDev ? '?sourceMap' : '';

// Plugins to be used only for production build
var prodPlugins = isDev
  ? []
  : [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin()
  ];

function NoErrorsPluginBeep() { }
NoErrorsPluginBeep.prototype.apply = function(compiler) {
  compiler.plugin('should-emit', function(compilation) {
    if(compilation.errors.length > 0) {
      process.stdout.write('Error \x07');
      return false;
    }
  });
  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('should-record', function() {
      if(compilation.errors.length > 0) {
        process.stdout.write('Error \x07');
        return false;
      }
    });
  });
};

var scssLoaders = [
  'css-loader',
  'autoprefixer-loader?browsers=last 2 version',
  'sass-loader?includePaths[]=' + path.resolve(__dirname, './app') + '&includePaths[]=' + path.resolve(__dirname, './node_modules')
];

var config = {
  entry: {
    'chrome-background': [ 'js/chrome-background.js' ],
    main: [
      /*'consolelog',
      'es5-shim',
      'es5-shim/es5-sham',
      'es6-shim',
      'es6-shim/es6-sham',
      'json3',
      'html5shiv/dist/html5shiv-printshiv.js',*/
     './app/js/app.js'
    ]
  },
  module: {
    preLoaders: [
      {
          test: /\.jsx?$/,
          exclude: /node_modules|bower_components/,
          loader: 'eslint-loader'
      }
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      // Copy the files required for a Firefox OS app, preserving their names
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader?importLoaders=1' + sourceMapParam.replace('?', '&')
          + '!postcss-loader' + sourceMapParam
        )
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract('style-loader', scssLoaders.join('!'))
      },
      {
        test: /\.mustache$/,
        loader: 'mustache?minify'
      },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
      { test: /\.(gif|jpg|jpeg|png)$/, loader: 'file-loader' },
      {
        test: /manifest\.webapp|manifest\.json$/,
        loader: 'file-loader?name=[name].[ext]'
      },
      {
        test: /js\/chrome-background\.js$/,
        loader: 'file-loader?name=js/[name].[ext]'
      },
      {
        test: /icons\/icon-(32|60|90|120|128|256|512)\.png/,
        loader: 'file-loader?name=icons/[name].[ext]'
      }
    ]
  },
  output: {
    filename: !isDev ?  'js/[name]-[hash].js' : 'js/[name].js',
    path: path.join(__dirname, './dist'),
    publicPath: './'
  },
  plugins: [
    new NoErrorsPluginBeep(),
    new ExtractTextPlugin(process.env.NODE_ENV === 'production' ? 'styles/[name]-[hash].css' : 'styles/[name].css'),
    new HtmlWebpackPlugin({ inject: true, template: './app/index.html' })//,
    //new webpack.optimize.UglifyJsPlugin(),
    //new webpack.DefinePlugin({GA_TRACKING_CODE: JSON.stringify('UA-89920-12')})
  ].concat(prodPlugins),
  resolve: {
    extensions: ['', '.jsx', '.js', '.sass', '.scss', '.css'],
    modulesDirectories: ['app', 'node_modules']
  },
  postcss: [
    // Support Firefox 32 and up, which is equivalent to Firefox OS 2.0 and up
    autoprefixer({browsers: ['Firefox 32']})
  ]
};

module.exports = config;
