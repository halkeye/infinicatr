'use strict';
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

var PORT = 3000;

config.devtool = '#eval';
//config.devtool = '#inline-source-map';
if (0) {
  config.entry.unshift( 'webpack-dev-server/client?http://' + require('os').hostname() + ':' + PORT );
  config.entry.unshift( 'webpack/hot/only-dev-server' );
  config.plugins.unshift( new webpack.HotModuleReplacementPlugin() );
  config.module.loaders.forEach(function(elm) {
    if (elm.hotLoaderModule) {
      elm.loaders.unshift(elm.hotLoaderModule);
    }
  });
}
var compiler = webpack(config);

var server = new WebpackDevServer(compiler, {
  contentBase: config.output.path,
  quiet: false,
  noInfo: false,
  //publicPath: '/books/',
  hot: true,
  stats: { colors: true },
  cache: false
});

server.listen(PORT, '0.0.0.0', function () {
  console.log('Listening on ' + PORT);
});
