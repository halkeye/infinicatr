'use strict';
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const path = require('path');

const sourcePath = path.join(__dirname, './app');
const distPath = path.join(__dirname, './dist');

module.exports = function (env) {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';
  const entry = {
    js: 'js/app.js'
  };

  const plugins = [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: ({ resource }) => /node_modules/.test(resource)
    }),
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      favicon: 'favicon.ico'
    }),
    new ExtractTextPlugin({
      disable: !isProd,
      filename: '[name].[contenthash].css',
      allChunks: true
    })
  ];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      })
    );
  } else {
    plugins.push(
      new webpack.HotModuleReplacementPlugin()
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'eval',
    context: sourcePath,
    entry: entry,
    output: {
      path: distPath,
      filename: !isProd ? '[name].bundle.js' : '[name].[chunkhash].bundle.js'
    },
    module: {
      rules: [
        {
          test: /manifest.json$/,
          loader: 'file-loader?name=manifest.json!web-app-manifest-loader'
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

    plugins,

    performance: isProd && {
      maxAssetSize: 100,
      maxEntrypointSize: 300,
      hints: 'warning'
    },

    stats: {
      colors: {
        green: '\u001b[32m'
      }
    },

    devServer: {
      contentBase: './src',
      historyApiFallback: true,
      port: 3000,
      compress: isProd,
      inline: !isProd,
      hot: !isProd,
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
};

/*
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
        test: /icons\/icon-(\d+)\.png/,
        loader: 'file-loader?name=icons/[name].[ext]'
      }
    ]
  },
  output: {
    filename: !isDev ? 'js/[name]-[hash].js' : 'js/[name].js',
    path: path.join(__dirname, './dist'),
    publicPath: './'
  },
  plugins: [
    new NoErrorsPluginBeep(),
    new ExtractTextPlugin(process.env.NODE_ENV === 'production' ? 'styles/[name]-[hash].css' : 'styles/[name].css'),
    new HtmlWebpackPlugin({ inject: true, template: './app/index.html' }) // ,
    // new webpack.optimize.UglifyJsPlugin(),
    // new webpack.DefinePlugin({GA_TRACKING_CODE: JSON.stringify('UA-89920-12')})
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
*/
