import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
// import gulpConfig from '../config';
import config from '../config';

// gulpConfig.isProdMode = true;

const $ = gulpLoadPlugins();

gulp.task('build', ['pug:build', 'extras'], () => {
  return gulp.src(`${config.build}**/*`).pipe($.size({title: 'build', gzip: true}));
});