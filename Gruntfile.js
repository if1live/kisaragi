module.exports = function(grunt) {
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
    vows: {
      all: {
        options: {
          // String {spec|json|dot-matrix|xunit|tap}
          // defaults to "dot-matrix"
          //reporter: "spec",
          // String or RegExp which is
          // matched against title to
          // restrict which tests to run
          //onlyRun: /helper/,
          // Boolean, defaults to false
          verbose: false,
          // Boolean, defaults to false
          silent: false,
          // Colorize reporter output,
          // boolean, defaults to true
          colors: true,
          // Run each test in its own
          // vows process, defaults to
          // false
          isolate: false,
          // String {plain|html|json|xml}
          // defaults to none
          coverage: "json"
        },
        // String or array of strings
        // determining which files to include.
        // This option is grunt's "full" file format.
        src: ["test/*.js"]
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
  grunt.loadNpmTasks("grunt-vows");
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  // Default task(s).
  grunt.registerTask('default', ['bowercopy']);
  grunt.registerTask('test', ['vows']);
};
