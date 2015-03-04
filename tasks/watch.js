module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.config('watch', {
    scripts: {
      files: ['assets/js/**/*.js'],
      tasks: ['concat:scripts', 'copy:scripts'],
      options: {
        spawn: false
      }
    },
    styles: {
      files: ['assets/css/**/*.css'],
      tasks: ['copy:css'],
      options: {
        spawn: false
      }
    },
    interface: {
      files: ['public/index.tmpl'],
      options: {
        livereload: true
      }
    },
  });
}
