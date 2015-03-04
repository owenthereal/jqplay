module.exports = function(grunt) {
  grunt.loadTasks('tasks');

  grunt.registerTask('build', "Builds the application.",
                     ['concat:scripts', 'cssmin', 'uglify']);
}
