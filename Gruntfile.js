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
            'underscore/*.js',
            'requirejs/require.js'
          ],
          'publish/libs/css': [
            'bootstrap/dist/css/*.css',
          ],
          'publish/libs/fonts': [
            'bootstrap/dist/fonts/*',
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bowercopy');


  // Default task(s).
  grunt.registerTask('default', ['bowercopy']);
};
