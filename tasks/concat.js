module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.config('concat', {
    scripts: {
      src: [
        'public/bower_components/angular/angular.js',
        'public/bower_components/angular-ui-ace/ui-ace.js',
        'assets/js/app.js',
        'assets/js/controllers.js',
        'assets/js/services.js',
        'assets/js/filters.js'
      ],
      dest: 'assets/tmp/app.js'
    }
  });
}
