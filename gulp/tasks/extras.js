import gulp from 'gulp';
import config from '../config';

gulp.task('extras', () => {
  // gulp.src(`${config.app}${config.images}**`).pipe(gulp.dest(`${config.build}${config.images}`));
  gulp.src(`${config.app}${config.assets}videos/**`).pipe(gulp.dest(`${config.build}${config.assets}videos`));
});