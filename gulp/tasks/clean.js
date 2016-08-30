import gulp from 'gulp';
import del from 'del';

gulp.task('clean', del.bind(null, ['.tmp', 'build']));
