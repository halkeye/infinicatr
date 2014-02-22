/*jshint node:true */
var path = require('path');
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    outdir: 'dist',
    copy3: {
      main: {
        files: [
          {expand: true, src: ['app/*.ico', 'app/index.html', 'app/manifest.webapp'], dest: '<%= outdir %>/'},
          //{src: ['../gaia/shared/style*/**/*.png'], dest: '<%= outdir %>/css/'},
          {src: ['app/img/**'], dest: '<%= outdir %>/img/'}
        ]
      },
    },
    copy2: {
      main: {
        files: [
          {src: ['app/*.ico', 'app/index.html', 'app/manifest.webapp'], dest: '<%= outdir %>/'},
          //{src: ['../gaia/shared/style*/**/*.png'], dest: '<%= outdir %>/css/'},
          {src: ['app/img/**'], dest: '<%= outdir %>/img/'}
        ]
      },
      gaia_style: {
        options: {
          basePath: '../gaia/shared/style'
        },
        files: [
          {src: ['../gaia/shared/style/**/*.png'], dest: '<%= outdir %>/css/'}
        ]
      },
      gaia_style_unstable: {
        options: {
          basePath: '../gaia/shared/style_unstable'
        },
        files: [
          {src: ['../gaia/shared/style_unstable/**/*.png'], dest: '<%= outdir %>/css/'}
        ]
      }
    },
    clean: [ '<%= outdir %>/' ],
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
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
        src: [ '<%= outdir %>/index.html' ],
        dest: '<%= outdir %>/index.html',
        replacements: [
          {
            from: '<html.*>',
            to: function(matchedWord) {
              if (matchedWord.match(/manifest="manifest.appcache"/)) { return matchedWord; }
              return matchedWord.replace('<html', '<html manifest="manifest.appcache"');
            }
          }
        ]
      }
    },
    'useminPrepare': {
      html: 'app/index.html',
      options: {
        root: 'app',
        dest: '<%= outdir %>/',
      }
    },
    usemin: {
      html: 'app/index.html',
//      html: ['<%= outdir %>/index.html'],
//      css: ['<%= outdir %>/css/app.css'],
      options: {
        assetDirs: ['app', '<%= outdir %>', 'Building-Blocks-gh-pages']
      }
    },
    uglify: {
      mangle: {toplevel: true},
      squeeze: {dead_code: false},
      codegen: {quote_keys: true}
    },
    connect: {
      server: {
        options: {
          port: 8008,
          directory: 'app',
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-gh-pages');

  /* TODO - add gh-pages */
  grunt.registerTask('serve', ['connect:keepalive']);
  grunt.registerTask('build', ['useminPrepare','copy','usemin','manifest']);
  grunt.registerTask('deploy', ['rsync']);

  // Default task.
  grunt.registerTask('default', ['jshint','clean','build','replace']);

};
