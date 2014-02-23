/*jshint node:true */
var path = require('path');
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  var gruntConfig = {
    pkg: grunt.file.readJSON('package.json'),
    webapp: grunt.file.readJSON('app/manifest.webapp'),
    outdir: 'dist',
    appdir: 'app',
    bowerdir: '<%= appdir %>/bower_components',

    copy: {
      main: {
        files: [
          {expand: true, cwd: 'app', src: ['*.ico', 'index.html', 'manifest.webapp'], dest: '<%= outdir %>/'},
          //{src: ['../gaia/shared/style*/**/*.png'], dest: '<%= outdir %>/css/'},
          {expand: true, cwd: 'app',src: ['img/**/*.png'], dest: '<%= outdir %>/'},
          {expand: true, cwd: '<%= bowerdir %>/building-blocks/style_unstable', src: ['progress_activity/**'], dest: '<%= outdir %>/css/'}
        ]
      },
    },
    clean: [ '<%= outdir %>/' ],
    watch: {
      app: {
        files: ['app/**/*'],
        tasks: ['clean', 'build']
      }
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
          hash: false,
          timestamp: true
        },
        src: [
          "*.html",
          "icons/icon-*.png",
          "lib/**/*",
          "img/**/*",
          "js/**/*",
          "css/**/*.css",
          "css/**/*.png",
        ],
        dest: "<%= outdir %>/manifest.appcache"
      }
    },
    rsync: {
      rib: {
        options: {
          src: '<%= outdir %>/',
          dest: "/home/apache/vhosts/kodekoan.com/apps/infinicatr/",
          host: "rib",
          recursive: true,
          syncDest: true
        }
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
    filerev: {
      images: { src: '<%= outdir %>/img/**/*.{jpg,jpeg,gif,png,webp}' },
      css: { src: '<%= outdir %>/css/**/*.css' },
      js: { src: '<%= outdir %>/js/**/*.js' }
    },
    'useminPrepare': {
      html: 'app/index.html',
      options: {
        dest: '<%= outdir %>/',
        assetDirs: ['app', '<%= outdir %>', '<%= bowerdir %>/building-blocks']
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
    },
    zip: {
      dist: {
        cwd: '<%= outdir %>',
        src: ['dist/**/*'],
        dest: '<%= pkg.name %>.zip'
      }
    },
    image_resize: {}
  };
  Object.keys(gruntConfig.webapp.icons).forEach(function(icon) {
    var files = {};
    files['dist/icons/icon-' + icon + '.png'] = 'app/icons/icon.svg';
    gruntConfig.image_resize['icon_' + icon] = {
      options: { width: icon, height: icon, upscale: true },
      files: files
    };
  });
  grunt.initConfig( gruntConfig );

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-manifest');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-filerev');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-zip');
  grunt.loadNpmTasks('grunt-image-resize');

  grunt.registerTask('serve', ['connect:server:keepalive']);
  /* Manifest is probably never going to be used, but when it is, make sure the index is altered as well */
  grunt.renameTask('manifest', 'origmanifest');
  grunt.registerTask('manifest', ['origmanifest','replace']);
  /* Build */
  grunt.registerTask('build', ['useminPrepare','copy','concat','cssmin','uglify','image_resize','filerev','usemin']);
  grunt.registerTask('deploy', ['rsync']);
  grunt.registerTask('dist', ['build', 'gh-pages', 'rsync']);

  // Default task.
  grunt.registerTask('default', ['jshint','clean','build','replace']);

};
