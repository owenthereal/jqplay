module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.config('clean', {
    js: [ 'public/js/*.js' ],
    css: [ 'public/css/*.css' ]
  });
}
