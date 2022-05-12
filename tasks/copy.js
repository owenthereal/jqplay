module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.config('copy', {
    fonts: {
      files: [
        {expand: true, flatten: true, src: 'node_modules/@bower_components/bootstrap/dist/fonts/*.*', dest: 'public/fonts/'}
      ]
    },
    images: {
      files: [
        {expand: true, flatten: true, src: 'assets/images/*.*', dest: 'public/images/'}
      ]
    },
    "robot.txt": {
      files: [
        {expand: true, flatten: true, src: 'assets/robots.txt', dest: 'public/'}
      ]
    }
  });
}
