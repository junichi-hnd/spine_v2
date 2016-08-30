import path from 'path';
import webpack from 'webpack';

const nodeModulesPath = path.join(__dirname, 'node_modules');
const isProduction = process.env.NODE_ENV === 'production';

export default {
  contentBase: path.resolve(__dirname, 'app'),
  cache: true,
  entry: [],
  resolveLoader: {
    root: nodeModulesPath
  },
  resolve: {
    root: [
      nodeModulesPath,
      path.join(__dirname, 'bower_components')
    ],
    // extensions: ['', '.tsx', '.ts', '.js', 'jsx']
    extensions: ['', '.tsx', '.ts', '.js', 'jsx', '.scss', '.css'],
    modulesDirectories: ['node_modules', 'bower_components'],
  },
  module: {
    preLoaders: [
      {
        test: /\.ts(x?)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'tslint',
        include: `${__dirname}/app/ts`
      },
    ],
    noParse: [],
    loaders: [
      {
        test: /\.ts(x?)$/,
        loader: 'babel?cacheDirectory,presets[]=' + require.resolve(path.join(nodeModulesPath, 'babel-preset-es2015-loose')) +
        '!ts-loader?configFileName=tsconfig.webpack.json!angular2-template-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?minimize'/*,
        include: path.resolve(__dirname, 'app', 'ts')*/
      },
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader?minimize&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader?-compress'/*,
        include: path.resolve(__dirname, 'app', 'ts')*/
      },
      {
        test: /\.module\.scss$/,
        loader: 'style-loader!css-loader?minimize&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader?-compress'/*,
        include: path.resolve(__dirname, 'app', 'ts')*/
      }
    ]
  },
  tslint: {
    emitErrors: true, // false = WARNING for webpack, true = ERROR for webpack
    formattersDirectory: path.join(nodeModulesPath, 'tslint-loader', 'formatters')
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
}
