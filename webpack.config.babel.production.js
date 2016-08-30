import path from 'path';
import baseConfig from './webpack.config.babel.base';
import webpack from 'webpack';
import webpackstrip from 'webpack-strip';
const ENV = process.env.NODE_ENV = process.env.ENV = 'production';
const config = Object.create(baseConfig);
/*config.entry = [
  './app/ts/Main.tsx'
];*/

config.entry = {
  main: [
    './app/ts/index.ts'
  ]/*,
  monitor: [
    './app/ts/monitor.ts'
  ]*/
};

/*config.module.loaders.push({
  test: /\.ts(x?)$/,
  loader: webpackstrip.loader('console.log', 'console.error'),
  include: __dirname,
  sourceMap: '',
  exclude: /(node_modules|bower_components)/
});*/

config.output = {
  path: path.join(__dirname, 'build', 'js'),
  publicPath: '/js/',
  filename: '[name].js',
  chunkFilename: '[chunkFilename].js'
};

config.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.NoErrorsPlugin(),
  new webpack.DefinePlugin({
    'ENV': JSON.stringify(ENV)
  }),
  /*new webpack.optimize.UglifyJsPlugin({
    mangle: {
      except: ['RouterLink', 'NgFor', 'NgModel']
    }
  })*/

  new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    mangle: false,
    compress : { screw_ie8 : true },
    comments: false
  })
];
export default config;
