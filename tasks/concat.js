module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.config('concat', {
    css: {
      src: [
        'public/bower_components/bootstrap/dist/css/bootstrap.css',
        'assets/css/app.css'
      ],
      dest: 'assets/tmp/app.css'
    },
    js: {
      src: [
        'public/bower_components/ace-builds/src-noconflict/ace.js',
        'public/bower_components/ace-builds/src-noconflict/ext-searchbox.js',
        'public/bower_components/ace-builds/src-noconflict/theme-github.js',
        'public/bower_components/ace-builds/src-noconflict/mode-jsoniq.js',
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
