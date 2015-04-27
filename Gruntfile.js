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
            'jquery/dist/*.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-bowercopy');


  // Default task(s).
  grunt.registerTask('default', ['bowercopy']);
};
