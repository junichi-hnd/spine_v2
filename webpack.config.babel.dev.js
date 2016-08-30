import path from 'path';
import baseConfig from './webpack.config.babel.base';
import webpack from 'webpack';

const config = Object.create(baseConfig);
config.debugMode = true;
config.devtool = '#source-map';

/*config.entry = [
  'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
  './app/ts/index.ts'
];*/

config.entry = {
  main: [
    'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true',
    './app/ts/index.ts'
  ]
};

config.output = {
  path: path.join(__dirname, '.tmp', 'js'),
  publicPath: '/js/',
  filename: '[name].js',
  chunkFilename: '[chunkFilename].js',
  sourceMapFilename: '[name].map'
};

config.plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoErrorsPlugin()
];

export default config;
