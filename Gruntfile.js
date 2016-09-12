module.exports = function (grunt) {
  grunt.initConfig({

    // Builds Sass
    sass: {
      dev: {
        files: {
          'public/stylesheets/main.css': 'public/sass/main.scss',
          'public/stylesheets/main-ie6.css': 'public/sass/main-ie6.scss',
          'public/stylesheets/main-ie7.css': 'public/sass/main-ie7.scss',
          'public/stylesheets/main-ie8.css': 'public/sass/main-ie8.scss',
          'public/stylesheets/elements-page.css': 'public/sass/elements-page.scss',
          'public/stylesheets/elements-page-ie6.css': 'public/sass/elements-page-ie6.scss',
          'public/stylesheets/elements-page-ie7.css': 'public/sass/elements-page-ie7.scss',
          'public/stylesheets/elements-page-ie8.css': 'public/sass/elements-page-ie8.scss',
          'public/stylesheets/prism.css': 'public/sass/prism.scss'
        },
        options: {
          includePaths: [
            'govuk_modules/govuk_template/assets/stylesheets',
            'govuk_modules/govuk_frontend_toolkit/stylesheets'
          ],
          outputStyle: 'expanded',
          imagePath: '../images'
        }
      }
    },

    // Empty encoded snippets folder
    clean: {
      contents: ['app/views/snippets/encoded/*']
    },

    // Copies templates and assets from external modules and dirs
    copy: {
      assets: {
        files: [{
          expand: true,
          cwd: 'app/assets/',
          src: ['**/*', '!sass/**'],
          dest: 'public/'
        }]
      },
      govuk: {
        files: [{
          expand: true,
          cwd: 'node_modules/govuk_frontend_toolkit/',
          src: '**',
          dest: 'govuk_modules/govuk_frontend_toolkit/'
        },
        {
          expand: true,
          cwd: 'node_modules/govuk_template_jinja/',
          src: '**',
          dest: 'govuk_modules/govuk_template/'
        }]
      },
      govuk_template_jinja: {
        files: [{
          expand: true,
          cwd: 'govuk_modules/govuk_template/views/layouts/',
          src: '**',
          dest: 'lib/'
        }]
      }
    },

    // Encode HTML snippets
    htmlentities: {
      files: {
        src: ['app/views/snippets/*.html'],
        dest: 'app/views/snippets/encoded/'
      }
    },

    // workaround for libsass
    replace: {
      fixSass: {
        src: ['govuk_modules/public/sass/**/*.scss'],
        overwrite: true,
        replacements: [{
          from: /filter:chroma(.*);/g,
          to: 'filter:unquote("chroma$1");'
        }]
      }
    },

    // Watches styles and specs for changes
    watch: {
      css: {
        files: ['public/sass/**/*.scss'],
        tasks: ['sass'],
        options: { nospawn: true }
      }
    },

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ext: 'html, js'
        }
      }
    },

    concurrent: {
      target: {
        tasks: ['watch', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    // Lint scss files
    shell: {
      multiple: {
        command: [
          'bundle',
          'bundle exec govuk-lint-sass public/sass/elements/'
        ].join('&&')
      }
    }

  })

  ;[
    'grunt-contrib-clean',
    'grunt-contrib-copy',
    'grunt-contrib-watch',
    'grunt-sass',
    'grunt-nodemon',
    'grunt-concurrent',
    'grunt-shell',
    'grunt-htmlentities'
  ].forEach(function (task) {
    grunt.loadNpmTasks(task)
  })

  grunt.registerTask('default', [
    'clean',
    'copy',
    'encode_snippets',
    'sass',
    'concurrent:target'
  ])

  grunt.registerTask(
    'encode_snippets',
    'Encode HTML snippets',
    function () {
      grunt.task.run('htmlentities')
    }
  )

  // Test
  grunt.registerTask(
    'test',
    function () {
      grunt.task.run('lint', 'test_default', 'test_default_success')
    }
  )

  // 1. Use govuk-scss-lint to lint the sass files
  grunt.registerTask(
    'lint',
    function () {
      grunt.task.run('shell', 'lint_success')
    }
  )

  // 2. Output a message once the scss-lint task has succeeded
  grunt.registerTask(
    'lint_success',
    function () {
      grunt.log.write('scss lint is complete, without errors.')
    }
  )

  // 3. Test that the default grunt task runs the app
  grunt.registerTask(
    'test_default',
    [
      'copy',
      'sass',
      'encode_snippets'
    ]
  )

  // 4. Output a message once the tests are complete
  grunt.registerTask(
    'test_default_success',
    function () {
      grunt.log.write('The tests are complete and the app runs, without errors.')
    }
  )
}
