module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['systemjs', 'jasmine'],
    systemjs: {
      strictImportSequence: true,
      configFile: 'config.js',
      config: {
        paths: {
          "*": "*",
          "dist/*": "dist/*",
          'phantomjs-polyfill': 'node_modules/phantomjs-polyfill/bind-polyfill.js',
          "systemjs": "node_modules/systemjs/dist/system.js",
          'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js',
          'es6-module-loader': 'node_modules/es6-module-loader/dist/es6-module-loader.js',
        },
        packages: {
          'test/unit/dist': {
            defaultExtension: 'js'
          },
          'test/unit/dist/views': {
            defaultExtension: 'js'
          },
          'test/unit/dist/services': {
            defaultExtension: 'js'
          },
          'test/unit/dist/stubs' : {
            defaultExtension: 'js'
          },
          'dist': {
            defaultExtension: 'js'
          }
        },
        transpiler: false
      },
      serveFiles: [
        'dist/**/*.*',
        'jspm_packages/**/*.js'
      ]
    },
    files: [
      'test/unit/dist/setup.js',
      'test/unit/dist/**/*.js'
    ],
    exclude: [],
    preprocessors: {
      'dist/**/*.js': 'coverage'
    },
    reporters: ['progress', 'junit'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['PhantomJS'],
    singleRun: false,
    coverageReporter: {
      type: 'json',
      subdir: '.',
      file: 'coverage-final.json'
    },
    junitReporter: {
      outputDir: 'test-reports'
    },
    browserNoActivityTimeout: 15000,
    browserDisconnectTolerance: 5,
    customLaunchers: {
      IE9: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE9'
      },
      IE8: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE8'
      },
      IE7: {
        base: 'IE',
        'x-ua-compatible': 'IE=EmulateIE7'
      }
    }
  });
};