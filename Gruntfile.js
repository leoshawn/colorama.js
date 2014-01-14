var fs = require('fs'),
    browserify = require('browserify'),
    pkg = require('./package.json');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      dist: {
        files: {
          src: ['lib/*.js']
        }
      },
      options: {
        browser: true,
        camelcase: true,
        curly: true,
        eqeqeq: true,
        expr: true,
        forin: true,
        indent: 2,
        noarg: true,
        node: true,
        quotmark: 'single',
        strict: true,
        undef: true,
        unused: true
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    uglify: {
      options: {
        banner: '/*\nColorama v<%= pkg.version %>\n\n' + grunt.file.read('LICENSE') + '\n*/\n'
      },
      dist: {
        files: {
          'dist/colorama-<%= pkg.version %>.min.js': ['dist/colorama-<%= pkg.version %>.js']
        }
      }
    }
  });

  grunt.registerTask('browserify', 'build a browser file', function() {
    var done = this.async();
    var outfile = 'dist/colorama-' + pkg.version + '.js';
    var bundle = browserify('./index.js').bundle(function(err, src) {
      console.log('File "' + outfile + '" created.');
      fs.writeFileSync(outfile, '/*\nColorama v' + pkg.version + '\n\n' + grunt.file.read('LICENSE') + '\n*/\n' + src);
      done();
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'mochaTest', 'browserify', 'uglify']);

};