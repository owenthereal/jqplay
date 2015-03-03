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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.config('uglify', {
    scripts: {
      files: {
        'public/js/app.js' : 'assets/tmp/app.js'
      },
      options: {
        mangle: false
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.config('cssmin', {
    app: {
      files: {
        'public/css/app.css': ['assets/css/app.css']
      }
    }
  });

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


  grunt.registerTask('build', "Builds the application.",
                     ['concat:scripts', 'cssmin', 'uglify']);
}
