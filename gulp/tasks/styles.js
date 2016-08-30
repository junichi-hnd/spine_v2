import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import gulpConfig from '../config';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const browsers = [
  'ie >= 11',
  'ff >= 41',
  'chrome >= 45',
  'safari >= 8',
  'ios >= 8',
  'android >= 4.4'
];

const sassOpt = {
  style: 'expanded',
  noCache: true,
  sourcemap: true,
  loadPath: './'
};


gulp.task('css', () => {
  const config = 'csscomb.json';
  const distDir = gulpConfig.isProdMode ? 'build/' : 'app/';
  gulp.src('app/styles/**/*.scss')
      .pipe($.plumber())
      .pipe($.sourcemaps.init())
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.sourcemaps.write({
        sourceRoot: './'
      }))
      .pipe($.autoprefixer(browsers))
      .pipe($.csscomb({config}))
      .pipe(gulp.dest(`${distDir}css/`))
      .pipe(reload({
        stream: true
      }))
});
