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
          {src: ['www/*.html'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/manifest.webapp'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/package.manifest'], dest: 'www-built/', filter: 'isFile'},
          {src: ['www/css/**'], dest: 'www-built/css/', filter: 'isFile'},
          {src: ['www/lib/**'], dest: 'www-built/lib/'}
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
          network: ["http://*", "https://*"],
          fallback: ["/ /offline.html"],
          exclude: ["js/jquery.min.js"],
          preferOnline: true,
          timestamp: true
        },
        src: [
            "*.html",
            "lib/*.min.js",
            "js/*.js",
            "css/*.css"
        ],
        dest: "../www-built/manifest.appcache"
      }
    },
    uglify: {}
  });

  grunt.loadNpmTasks('grunt-contrib-manifest');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-clean');

  grunt.registerTask('build', 'concat min copy manifest compress');

  // Default task.
  grunt.registerTask('default', 'lint qunit clean build');

};
