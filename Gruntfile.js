var fs = require('fs'),
    browserify = require('browserify'),
    pkg = require('./package.json');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
        banner: '/*\nColorama v<%= pkg.version %>.\n\n' + grunt.file.read('LICENSE') + '\n*/\n'
      },
      dist: {
        files: {
          'dist/colorama.min.js': ['dist/colorama.js']
        }
      }
    }
  });

  grunt.registerTask('browserify', 'build a browser file', function() {
    var done = this.async();
    var outfile = './dist/colorama.js';
    var bundle = browserify('./index.js').bundle(function(err, src) {
      console.log('> ' + outfile);
      fs.writeFileSync(outfile, src);
      done();
    });
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['browserify', 'uglify']);

};