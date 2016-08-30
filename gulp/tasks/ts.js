import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import developmentConfig from '../../webpack.config.babel.dev';
import proConfig from '../../webpack.config.babel.production';
import webpack from 'webpack';
import yargs from 'yargs';

const $ = gulpLoadPlugins();

gulp.task('ts', () => {
  const arg = yargs.argv.type;
  const config = (typeof arg !== 'undefined' && arg === 'prod') ? proConfig : developmentConfig;
  const setting = webpack(config);
  setting.run((error, stats) => {
    if(error) {
      throw new Error('webpack build failed');
    }
    $.util.log(stats.toString({
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: true,
      chunkModules: false
    }));
  });
});

/*
gulp.task('ts:prod', () => {
  const setting = webpack(proConfig);
  setting.run((error, stats) => {
    if(error) {
      throw new Error('webpack build failed');
    }
    $.util.log(stats.toString({
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: true,
      chunkModules: false
    }));
  });
});*/
