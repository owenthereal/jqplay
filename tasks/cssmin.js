module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.config('cssmin', {
    app: {
      files: {
        'public/css/app.min.<%= grunt.option("ts") %>.css': ['assets/tmp/app.css']
      }
    }
  });
}
