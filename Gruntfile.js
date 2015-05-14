module.exports = function(grunt) {
  "use strict";
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bowerrc: grunt.file.readJSON('.bowerrc'),
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
            'pathfinding/*.js'
          ],
          'publish/libs/css': [
            'bootstrap/dist/css/*.css',
          ],
          'publish/libs/fonts': [
            'bootstrap/dist/fonts/*',
          ]
        }
      }
    },
    mocha_istanbul: {
      coverage: {
        src: 'test', // a folder works nicely
        options: {
          ui: 'bdd',
          reporter: 'dot',
          mask: '*.spec.js'
        }
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
        script: 'app.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'lib/*.js', 'test/*.js'],
      options: {
        reporter: require('jshint-stylish')
      }
    }
  });

  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  // Default task(s).
  grunt.registerTask('default', ['bowercopy']);
  
  grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
  
};
