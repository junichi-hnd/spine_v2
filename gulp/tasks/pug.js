import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';

import { pugConfig } from '../../app/pug/pug.config.babel';
import config from '../config';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const executeTask = function(isProd) {
  const distDir = isProd ? config.build : config.app;
  return gulp.src(`${config.app}${config.pug}**/!(_)*.pug`)
      .pipe($.plumber())
      .pipe($.pug({
        data: pugConfig,
        pretty: !isProd
      }))
      .pipe(gulp.dest(distDir));
};

gulp.task('pug', () => {
  /*const distDir = config.isProdMode ? config.build : config.app;
  return gulp.src(`${config.app}${config.pug}**!/!(_)*.pug`)
      .pipe($.plumber())
      .pipe($.pug({
        data: pugConfig,
        pretty: false
      }))
      .pipe(gulp.dest(distDir));*/
  executeTask(false);
});

gulp.task('pug:build', () => {
  executeTask(true);
});
