var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('../paths');
var typescript = require('gulp-typescript');
var babel = require('gulp-babel');
var del = require('del');
var Karma = require('karma').Server;

gulp.task('clean-test', function() {
  return del(paths.unitSpecsDist + '*');
});

// transpiles files in
// /test/unit/src/ from ts to es5
// then copies them to test/unit/dist/
var typescriptCompiler = typescriptCompiler || null;
gulp.task('build-test', ['clean-test'], function() {
  if(!typescriptCompiler) {
    typescriptCompiler = typescript.createProject('tsconfig.json', {
      "typescript": require('typescript'),
      module: 'commonjs'
    });
  }
  return gulp.src(paths.dtsSrc.concat(paths.unitSpecsSrc))
    .pipe(changed(paths.unitSpecsDist, {extension: '.ts'}))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(typescript(typescriptCompiler))
    .pipe(babel({ presets: ["es2015", "stage-3"] }))
    .pipe(replace("src/", "dist/"))
    .pipe(rename(function(path) {
      path.dirname = path.dirname.replace('test\\unit\\src', '')
    }))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: '/test/unit/src'}))
    .pipe(gulp.dest(paths.unitSpecsDist));
});

/**
 * Run test once and exit
 */
gulp.task('test', ['build-test'], function (done) {
  var karma = new Karma({
    configFile: __dirname + '/../../karma.conf.js',
    singleRun: true
  });

  karma.on('run_complete', function(browsers, results) {
    done(results.error ? 'There are test failures': null);
  });

  karma.start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
  new Karma({
    configFile: __dirname + '/../../karma.conf.js'
  }, function() { done(); }).start();
});
