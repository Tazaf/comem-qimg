module.exports = function(grunt) {

  grunt.initConfig({
    'gh-pages': {
      options: {
        base: 'doc/build'
      },
      src: ['**']
    },
    jshint: {
      files: ['Gruntfile.js', 'app.js', 'bin/www', 'lib/**/*.js', 'routes/**/*.js', 'spec/**/*.js']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('ghp', ['gh-pages']);
};
