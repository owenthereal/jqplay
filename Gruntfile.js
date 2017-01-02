module.exports = function(grunt) {
  grunt.loadTasks('tasks');
  grunt.registerTask('build', "Builds the application.",
                     ['clean', 'concat', 'cssmin', 'uglify', 'replace']);
  grunt.option('ts', new Date().getTime());
}
