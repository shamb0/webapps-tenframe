module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-tizen');
  grunt.loadTasks('tools/grunt-tasks');

  grunt.initConfig({
    packageInfo: grunt.file.readJSON('package.json'),

    clean: ['build'],

    // this uglifies the main module (and its dependency graph)
    // and copies it to build/app/main.min.js
    requirejs: {
      dist: {
        options: {
          baseUrl: './js',

          // include the main requirejs configuration file;
          // see notes in that file on the allowed format
          mainConfigFile: 'js/require-config.js',

          // main application module
          name: 'main',

          // output
          out: 'build/main.min.js',

          // we don't need to wrap the js in an anonymous function,
          // as our main.js runs the application
          wrap: false,

          // remove license comments from js files
          preserveLicenseComments: false,

          uglify: {
            beautify: false,
            toplevel: true,
            ascii_only: true,
            no_mangle: false,
            max_line_length: 1000
          }
        }
      }
    },

    uglify: {
      dist: {
        files: {
          'build/app/lib/require.min.js': [ 'lib/requirejs/require.js' ],
          'build/app/js/app.js': [ 'js/app.js' ],
          'build/app/js/license.js': [ 'js/license.js' ],
          'build/app/js/help.js': [ 'js/help.js' ],
          'build/app/js/animation.js': [ 'js/animation.js' ],
          'build/app/js/sound.js': [ 'js/sound.js' ],
          'build/app/js/pirates.js': [ 'js/pirates.js' ],
          'build/app/js/rockets.js': [ 'js/rockets.js' ],
          'build/app/js/bowling.js': [ 'js/bowling.js' ]
        }
      },
      perf: {
        files: {
          'build/save-perf-data.min.js': [
            'tools/save-perf-data.js'
          ]
        }
      }
    },

    // minify and concat CSS
    cssmin: {
      dist: {
        files: {
          'build/app/css/all.css': ['css/*.css']
        }
      }
    },

    // copy files required for the wgt package
    copy: {
      common: {
        files: [
          { src: 'build/main.min.js', dest: 'build/app/js/main.min.js' },
          { expand: true, cwd: '.', src: ['audio/**'], dest: 'build/app/' },
          { expand: true, cwd: '.', src: ['fonts/**'], dest: 'build/app/' },
          { expand: true, cwd: '.', src: ['README.txt'], dest: 'build/app/' },
          { expand: true, cwd: '.', src: ['LICENSE'], dest: 'build/app/' }
        ]
      },
      wgt: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/wgt/' },
          { expand: true, cwd: '.', src: ['config.xml'], dest: 'build/wgt/' },
          { expand: true, cwd: '.', src: ['icon.png'], dest: 'build/wgt/' }
        ]
      },
      crx: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/crx/' },
          { expand: true, cwd: '_locales', src: ['**'], dest: 'build/crx/_locales' },
          { expand: true, cwd: '.', src: ['manifest.json'], dest: 'build/crx/' },
          { expand: true, cwd: '.', src: ['icon.png'], dest: 'build/crx/' }
        ]
      },
      sdk: {
        files: [
          { expand: true, cwd: 'build/app/', src: ['**'], dest: 'build/sdk/' },
          {
            src: 'lib/requirejs/require.js',
            dest: 'build/sdk/lib/requirejs/require.js'
          },
          {
            src: 'lib/requirejs-domready/domReady.js',
            dest: 'build/sdk/lib/requirejs-domready/domReady.js'
          },
          {
            src: 'lib/jquery/jquery.js',
            dest: 'build/sdk/lib/jquery/jquery.js'
          },
          { expand: true, cwd: 'js', src: ['**'], dest: 'build/sdk/js/' },
          { expand: true, cwd: 'css', src: ['**'], dest: 'build/sdk/css/' },
          { expand: true, cwd: '.', src: ['*.html'], dest: 'build/sdk/' },
          { expand: true, cwd: '.', src: ['config.xml'], dest: 'build/sdk/' },
          { expand: true, cwd: '.', src: ['icon.png'], dest: 'build/sdk/' }
        ]
      }
    },

    htmlmin: {
      dist: {
        files: [
          { expand: true, cwd: '.', src: ['*.html'], dest: 'build/app/' }
        ],
        options: {
          removeComments: true,
          collapseWhitespace: true,
          removeCommentsFromCDATA: false,
          removeCDATASectionsFromCDATA: false,
          removeEmptyAttributes: true,
          removeEmptyElements: false
        }
      }
    },

    // replace stylesheet and js elements
    condense: {
      dist: {
        file: 'build/app/index.html',
        script: {
          src: 'lib/require.min.js',
          attrs: {
            'data-main': 'js/main.min'
          }
        },
        stylesheet: 'css/all.css'
      }
    },

    imagemin: {
      dist: {
        options: {
          optimizationLevel: 3,
          progressive: true
        },
        files: [
          { expand: true, cwd: '.', src: ['images/**'], dest: 'build/app/' }
        ]
      }
    },

    // make wgt package in build/ directory
    package: {
      wgt: {
        appName: '<%= packageInfo.name %>',
        version: '<%= packageInfo.version %>',
        files: 'build/wgt/**',
        stripPrefix: 'build/wgt/',
        outDir: 'build',
        suffix: '.wgt',
        addGitCommitId: false
      },
      sdk: {
        appName: '<%= packageInfo.name %>',
        version: '<%= packageInfo.version %>',
        files: 'build/sdk/**',
        stripPrefix: 'build/sdk/',
        outDir: 'build',
        suffix: '.wgt',
        addGitCommitId: false
      }
    },

    tizen_configuration: {
      tizenAppScriptDir: '/home/developer/',
      configFile: 'config.xml',
      sdbCmd: 'sdb'
    },

    tizen: {
      push: {
        action: 'push',
        localFiles: {
          pattern: 'build/*.wgt',
          filter: 'latest'
        },
        remoteDir: '/home/developer/'
      },

      install: {
        action: 'install',
        remoteFiles: {
          pattern: '/home/developer/*.wgt',
          filter: 'latest'
        }
      },

      uninstall: {
        action: 'uninstall'
      },

      start: {
        action: 'start',
        stopOnFailure: true
      },

      stop: {
        action: 'stop',
        stopOnFailure: false
      },

      pushdumpscript: {
        action: 'push',
        localFiles: 'tools/dump-localStorage.sh',
        remoteDestDir: '/home/developer/',
        chmod: '+x',
        overwrite: true
      },

      dumplocalstorage: {
        action: 'script',
        remoteScript: '/home/developer/dump-localStorage.sh'
      }
    },

    inline: {
      script: 'build/save-perf-data.min.js',
      htmlFile: 'build/app/index.html'
    },

    simple_server: {
      port: 30303,
      dir: 'build/app/'
    }
  });

  grunt.registerTask('dist', [
    'clean',
    'imagemin:dist',
    'requirejs:dist',
    'uglify:dist',
    'cssmin:dist',
    'htmlmin:dist',
    'copy:common',
    'condense'
  ]);

  grunt.registerTask('crx', ['dist', 'copy:crx']);
  grunt.registerTask('wgt', ['dist', 'copy:wgt', 'package:wgt']);

  grunt.registerTask('sdk', [
    'clean',
    'imagemin:dist',
    'copy:common',
    'copy:sdk',
    'package:sdk'
  ]);

  grunt.registerTask('perf', [
    'dist',
    'uglify:perf',
    'inline',
    'copy:wgt',
    'package:wgt'
  ]);

  grunt.registerTask('install', [
    'tizen_prepare',
    'tizen:push',
    'tizen:stop',
    'tizen:uninstall',
    'tizen:install',
    'tizen:start'
  ]);

  grunt.registerTask('wait', function () {
    var done = this.async();
    setTimeout(function () {
      done();
    }, 10000);
  });

  grunt.registerTask('perf-test', function () {
    var tasks = ['tizen:pushdumpscript', 'perf', 'install', 'tizen:stop'];

    for (var i = 0; i < 11; i++) {
      tasks.push('tizen:start', 'wait', 'tizen:stop');
    }

    tasks.push('tizen:dumplocalstorage')

    grunt.task.run(tasks);
  });

  grunt.registerTask('restart', ['tizen:stop', 'tizen:start']);

  grunt.registerTask('server', ['dist', 'simple_server']);

  grunt.registerTask('wgt-install', ['wgt', 'install']);
  grunt.registerTask('sdk-install', ['sdk', 'install']);

  grunt.registerTask('default', 'wgt');
};
