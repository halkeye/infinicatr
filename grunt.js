/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['grunt.js', 'app/js/**/*.js', 'test/**/*.js']
    },
    cssmin: {
      main: {
        src: 'www-built/css/app.css',
        dest: 'www-built/css/app.css'
      }
    },
    copy: {
      main: {
        files: [
          {src: ['app/*.ico', 'app/index.html', 'app/manifest.webapp'], dest: 'www-built/'},
          //{src: ['../gaia/shared/style*/**/*.png'], dest: 'www-built/css/'},
          {src: ['app/img/**'], dest: 'www-built/img/'}
        ]
      },
      gaia_style: {
        options: {
            basePath: '../gaia/shared/style'
        },
        files: [
          {src: ['../gaia/shared/style/**/*.png'], dest: 'www-built/css/'}
        ]
      },
      gaia_style_unstable: {
        options: {
            basePath: '../gaia/shared/style_unstable'
        },
        files: [
          {src: ['../gaia/shared/style_unstable/**/*.png'], dest: 'www-built/css/'}
        ]
      }
    },
    clean: {
        www_built: "www-built/"
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: "www-built",
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
        dest: "../www-built/manifest.appcache"
      }
    },
    rsync: {
        "deploy-live": {
            src: "www-built/",
            dest: "/home/apache/vhosts/kodekoan.com/apps/infinicatr/",
            host: "rib",
            recursive: true,
            syncDest: true
        }
    },
    replace: {
        appcache: {
            src: [ 'www-built/index.html' ],
            dest: 'www-built/index.html',
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
        html: 'app/index.html'
    },
    usemin: {
        html: ['www-built/index.html'],
        css: ['www-built/css/app.css'],
        options: {
            dirs: ['app', 'www-built', '../gaia/']
        }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-manifest');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('build', 'useminPrepare copy concat min cssmin usemin manifest');
  grunt.registerTask('deploy', 'rsync');

  // Default task.
  grunt.registerTask('default', 'lint clean build replace');

};
