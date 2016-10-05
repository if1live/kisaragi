// Ŭnicode please
module.exports = function (grunt) {
  "use strict";
  
  // Reference
  // https://github.com/varju/typescript-node-mocha-example

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bowerrc: grunt.file.readJSON('.bowerrc'),
    env: {
      test: {
        NODE_ENV: 'test'
      },
      dev: {
        NODE_ENV: 'development'
      },
      prod: {
        NODE_ENV: 'production'
      }
    },
    bowercopy: {
      options: {
        clean: false
      },
      glob: {
        files: {
          'publish/libs/js': [
            'socket.io-client/socket.io.js',
            'phaser/build/phaser.min.js',
            'bootstrap/dist/js/*.js',
            'jquery/dist/*.js',
            'jquery-ui/*.js',
            'underscore/*.js',
            'requirejs/require.js',
            'assert/assert.js',
            'sprintf/dist/sprintf.min.js',
            'pathfinding/*.js',
            'mocha/mocha.js',
            'node-uuid/uuid.js'
          ],
          'publish/libs/css': [
            'bootstrap/dist/css/*.css',
            'mocha/mocha.css'
          ],
          'publish/libs/fonts': [
            'bootstrap/dist/fonts/*',
          ]
        }
      }
    },
    tsd: {
      refresh: {
        options: {
          // execute a command
          command: 'reinstall',

          //optional: always get from HEAD
          latest: true,

          // specify config file
          config: 'tsd.json',

          // experimental: options to pass to tsd.API
          opts: {
            // props from tsd.Options
          }
        }
      }
    },
    typescript: {
      app: {
        src: [
          'app/**/*.ts',
          'external/**/*.ts'
        ],
        dest: 'app/kisaragi.js',
        options: {
          module: 'commonjs',
          sourcemap: true,
          target: 'ES5'
        }
      },
      client: {
        src: ['app_client/**/*.ts'],
        dest: 'publish/app_client.js',
        options: {
          module: 'commonjs',
          sourcemap: true,
          target: 'ES5'
        }
      },
      test: {
        src: ['test/**/*.ts'],
        options: {
          module: 'commonjs',
          sourcemap: true,
          target: 'ES5'
        }
      }
    },
    watch: {
      app: {
        files: ['app/**/*.ts'],
        tasks: ['typescript', '_runTests']
      },
      test: {
        files: ['test/**/*.ts'],
        tasks: ['typescript:test', '_runTests']
      },
      client: {
        files: ['app_client/**/*.ts'],
        tasks: ['typescript:client', '_runTests']
      },
      definitions: {
        files: ['typings/**/*.d.ts'],
        tasks: ['typescript', '_runTests']
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'dot',
          ui: 'bdd',
          quiet: false
        },
        src: ['test/**/*.js']
      },
      coverage: {
        options: {
//        reporter: 'html-cov',
          quiet: true,
          captureFile: 'build/coverage.html'
        },
        src: ['test/**/*.js']
      }
    },
    mocha_istanbul: {
      coverage: {
        src: ['test'],
        options: {
          coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
          ui: 'bdd',
          reporter: 'dot',
          mask: '*_spec.js'
        },
        root: './app', // define where the cover task should consider the root of libraries that are covered by tests
        reportFormats: ['cobertura','lcovonly']
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage*', // will check both coverage folders and merge the coverage results
          check: {
            lines: 80,
            statements: 80
          }
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'run_server.js',
          watchedExtensions: ['js', 'json'],
          watchedFolders: ['app', 'test']
        }
      }
    },
    tslint: {
      options: {
        configuration: grunt.file.readJSON("tslint.json")
      },
      files: {
        src: ['app/**/*.ts', 'test/**/*.ts']
      }
    }
  });

  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-tsd');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-tslint');

  // Default task(s).
  grunt.registerTask('default', ['bowercopy']);

  grunt.registerTask('_runTests', ['env:test', 'mochaTest']);
  grunt.registerTask('test', ['typescript', '_runTests']);
  grunt.registerTask('dev', ['env:dev', 'nodemon']);
  grunt.registerTask('prod', ['env:prod', 'nodemon']);

  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};
