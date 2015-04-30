"use strict";

module.exports = function(grunt) {
  
  var loadGruntTasks = require('load-grunt-tasks')(grunt, {
      pattern: 'grunt-*',
      config: './package.json',
      scope: 'devDependencies'
  });
  var dir = null;
  var basePath = grunt.option('basePath') || "./";
  
  
  var config = {
    'basePath': basePath,
    'dir': dir,
    bump: {
      options: {
        files:"./package.json",
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'],
        createTag:false,
        push:true,
        pushTo:"",
        pushTags:false
      }
    },
    shell: {
      "publish":{
        command:"npm publish --registry=http://npm-scispike.ddns.net",
      },
      "pull":{
        command:"git pull"
      },
      "add-owner":{
        command:["npm owner add",grunt.option("owner") , 'mongoose-shortid',"--registry=http://npm-scispike.ddns.net"].join(' '),
      }
    }
  };
  
  grunt.initConfig(config);

  grunt.registerTask('add-owner',["shell:add-owner"]);
  grunt.registerTask('release-patch', ['shell:pull'].concat(['bump:patch',"shell:publish"])); 
  grunt.registerTask('release-minor', ['shell:pull'].concat(['bump:minor',"shell:publish"])); 
};