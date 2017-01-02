module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.config('uglify', {
    scripts: {
      files: {
        'public/js/app.min.<%= grunt.option("ts") %>.js': 'assets/tmp/app.js'
      },
      options: {
        mangle: false
      },
    }
  });
}
