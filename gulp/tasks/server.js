import gulp from 'gulp';
import url from 'url';
import browserSync from 'browser-sync';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import webpackConfig from '../../webpack.config.babel.dev';
import config from '../config';

const _bundler = webpack(webpackConfig);
const _reload = browserSync.reload;

gulp.task('server', [], () => {
  browserSync({
    notify: false,
    port: 9000,
    open: false,
    reloadOnRestart: true,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components',
        '/node_modules' : 'node_modules'
      },
      middleware: [
        webpackDevMiddleware(_bundler, {
          publicPath: webpackConfig.output.publicPath,
          noInfo: false,
          quiet: false,
          stats: {
            colors: true,
            version: false,
            hash: false,
            timings: false,
            chunks: true,
            chunkModules: false
          }
        }),
        webpackHotMiddleware(_bundler),
        (req, res, next) => {
          const fileName = url.parse(req.url);
          // リロード時に404にならないようにrewrite
          if(/\/(compare|factor|cv|imagescale)/.test(fileName.pathname)){
            req.url = '/index.html';
          }
          return next();
        }
      ]
    }
  });
  console.log(`${config.app}${config.pug}**/*.pug`);
  gulp.watch(`${config.app}${config.ts}**/*.ts`, ['ts']);
  gulp.watch(`${config.app}${config.pug}**/*.pug`, ['pug']);
  gulp.watch([`${config.app}*.html`]).on('change', _reload);
  // gulp.watch('app/ts/**/*.ts', ['ts']);
  // gulp.watch('app/styles/**/*.scss', ['css']);
  // gulp.watch('app/pug/**/*.pug', ['pug']);
  // gulp.watch(['app/*.html']).on('change', _reload);
});

gulp.task('server:build', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['build']
    }
  });
});