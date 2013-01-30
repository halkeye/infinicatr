/*jshint node:true */
var path = require('path');
module.exports = function(grunt) {
  "use strict";

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',

    server: {
      port: 8008,
      base: './app'
    },
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
      tasks: 'lint'
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
    uglify: {
      mangle: {toplevel: true},
      squeeze: {dead_code: false},
      codegen: {quote_keys: true}
    }
  });

  grunt.loadNpmTasks('grunt-contrib-manifest');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('serve', 'Serve dev directory', function() {
    var connect;
    var done = this.async();

    try {
      connect = require('connect');
    }
    catch(e) {
      console.log('To use the `serve` command, you must ' +
        'install the connect module:\n\n' + 
        'npm install connect');
      return;
    }

    var port = 8008;
    var base = path.join(process.cwd(), 'app');
    var middleware = [
      connect['static'](base),
      connect.directory(base)
    ];

    connect.logger.format("OpenWebApp",
        "[D] server :method :url :status " +
        ":res[content-length] - :response-time ms");
    middleware.unshift(connect.logger("OpenWebApp"));

    console.log("starting web server on port " + port);
    connect.apply(null, middleware).listen(port).on('close', done);
  });

  grunt.registerTask('build', 'useminPrepare copy concat min cssmin usemin manifest');
  grunt.registerTask('deploy', 'rsync');

  // Default task.
  grunt.registerTask('default', 'lint clean build replace');

};
