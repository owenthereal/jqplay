module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.config('copy', {
    scripts: {
      files: [
        {expand: true, flatten: true, src: 'assets/tmp/**/*.js', dest: 'public/js/'}
      ]
    },
    css: {
      files: [
        {expand: true, flatten: true, src: 'assets/css/**/*.css', dest: 'public/css/'}
      ]
    }
  });
}
