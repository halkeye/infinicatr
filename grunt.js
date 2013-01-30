/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    lint: {
      files: ['grunt.js', 'www/js/**/*.js', 'test/**/*.js']
    },
    copy: {
      main: {
        files: [
          {src: ['www/*.ico', 'www/index.html', 'www/manifest.webapp'], dest: 'www-built/'},
          {src: ['../gaia/shared/style*/**/*.png'], dest: 'www-built/shared/'},
          {src: ['www/img/**'], dest: 'www-built/img/'}
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
        html: 'www-built/index.html'
    },
    usemin: {
        html: ['www-built/index.html'],
        css: ['www-built/app.css'],
        options: {
            dirs: ['www', 'www-built', '../gaia/']
        }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-manifest');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('build', 'copy usemin replace manifest');
  grunt.registerTask('deploy', 'rsync');

  // Default task.
  grunt.registerTask('default', 'lint clean build');

};
