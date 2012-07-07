module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/qunit2node.test.js']
    },

    concat: {
      nodeTests: {
        src: ['lib/qunit2node.head.js', 'test/qunit/a_qunit.test.js'],
        dest: 'test/qunit2node.test.js'
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'concat test');

};