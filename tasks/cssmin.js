module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.config('cssmin', {
    app: {
      files: {
        'public/css/app.css': ['assets/css/app.css']
      }
    }
  });
}
