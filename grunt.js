/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    lint: {
      files: ['grunt.js', 'www/js/**/*.js', 'test/**/*.js']
    },
    qunit: {
      files: ['test/**/*.html']
    },
    copy: {
      main: {
        files: [
          {src: ['www/*.ico'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/index.html'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/manifest.webapp'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/img/**'], dest: 'www-built/img/'}
        ]
      }
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', 'www/js/*.js'],
        dest: 'www-built/js/app-main.min.js'
      }
    },
    clean: {
        www_built: "www-built/"
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'www-built/js/app-main.min.js'
      }
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
    compress: {
      zip: {
        files: {
          "package.zip": [ "www-built/**"] 
        }
      }
    },
    manifest: {
      generate: {
        options: {
          basePath: "www",
          network: ["*", "http://*", "https://*"],
          preferOnline: true,
          timestamp: true
        },
        src: [
            "*.html",
            "img/icons/icon-*.png",
            "lib/*.min.js",
            "js/*.js",
            "css/*.css",
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
                    from: '<html',
                    to: function(matchedWord) {
                        if (matchedWord.match(/manifest="manifest.appcache"/)) { return matchedWord; }
                        return '<html manifest="manifest.appcache"';
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
            dirs: ['www', 'www-built']
        }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-manifest');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-clean');
  grunt.loadNpmTasks('grunt-rsync');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-usemin');

  grunt.registerTask('build', 'concat min copy manifest usemin replace');
  grunt.registerTask('deploy', 'rsync');

  // Default task.
  grunt.registerTask('default', 'lint qunit clean build');

};
