/*jshint node:true */
var path = require('path');
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    outdir: 'dist',
    copy: {
      main: {
        files: [
          {expand: true, cwd: 'app', src: ['*.ico', 'index.html', 'manifest.webapp'], dest: '<%= outdir %>/'},
          //{src: ['../gaia/shared/style*/**/*.png'], dest: '<%= outdir %>/css/'},
          {src: ['app/img/**'], dest: '<%= outdir %>/img/'},
          {expand: true, cwd: 'bower_components/building-blocks/style_unstable', src: ['progress_activity/**'], dest: '<%= outdir %>/css/'}
        ]
      },
    },
    clean: [ '<%= outdir %>/' ],
    watch: {
      files: '<config:lint.files>',
      tasks: 'jslint'
    },
    jshint: {
      all: ['Gruntfile.js', 'app/js/**/*.js', 'test/**/*.js']
    },
    manifest: {
      generate: {
        options: {
          basePath: "<%= outdir %>",
          network: ["*", "http://*", "https://*"],
          preferOnline: true,
          timestamp: true
        },
        src: [
          "*.html",
          "img/icons/icon-*.png",
          "lib/**/*",
          "js/**/*",
          "css/**/*.css",
          "shared/**"
        ],
        dest: "<%= outdir %>/manifest.appcache"
      }
    },
    rsync: {
      "deploy-live": {
        src: "<%= outdir %>/",
        dest: "/home/apache/vhosts/kodekoan.com/apps/infinicatr/",
        host: "rib",
        recursive: true,
        syncDest: true
      }
    },
    replace: {
      appcache: {
        files: [{src:['<%= outdir %>/index.html'], dest: '<%= outdir %>/index.html'}],
        options: {
          patterns: [
            {
              match: /<html.*>/,
              replacement: function(matchedWord) {
                if (matchedWord.match(/manifest="manifest.appcache"/)) { return matchedWord; }
                return matchedWord.replace('<html', '<html manifest="manifest.appcache"');
              }
            }
          ]
        }
      }
    },
    'useminPrepare': {
      html: 'app/index.html',
      options: {
        dest: '<%= outdir %>/',
        assetDirs: ['app', '<%= outdir %>', 'bower_components/building-blocks']
      }
    },
    usemin: {
      html: '<%= outdir %>/index.html',
    },
    /*uglify: {
      mangle: {toplevel: true},
      squeeze: {dead_code: false},
      codegen: {quote_keys: true}
    },*/
    connect: {
      server: {
        options: {
          port: 8008,
          directory: 'app',
          livereload: true
        }
      }
    },
    'gh-pages': {
      options: {
        base: '<%= outdir %>',
      },
      src: ['**']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-gh-pages');

  /* TODO - add gh-pages */
  grunt.registerTask('serve', ['connect:server:keepalive']);
  grunt.registerTask('build', ['useminPrepare','copy','concat','cssmin','uglify','usemin']);
  grunt.registerTask('deploy', ['rsync']);
  grunt.registerTask('dist', ['build','replace','gh-pages']);

  // Default task.
  grunt.registerTask('default', ['jshint','clean','build','replace']);

};
