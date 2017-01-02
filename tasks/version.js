module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.config('replace', {
    'index.tmpl': {
      src: ['assets/index.tmpl'],
      dest: 'public/index.tmpl',
      replacements: [{
        from: '#{ TIMESTAMP }',
        to: '<%= grunt.option("ts") %>'
      }]
    }
  })
}
