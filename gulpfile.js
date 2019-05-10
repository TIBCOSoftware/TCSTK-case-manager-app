const gulp = require('gulp');
//import functions
require('./build/functions');

// Read TIBCO cloud properties...
const PropertiesReader = require('properties-reader');
const properties = PropertiesReader('tibco-cloud.properties');
const props = properties.path();

//TODO: Add a start (local) task

// Function to build the cloud starter
function build() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Building... ' + props.App_Name);
    //TODO: Remove the old zip file
    //TODO: Check if we are in build mode (and not debug)
    buildCloudStarterZip(props.App_Name);
    resolve();
  });
};

// Function to delpoy the cloud starter
function deploy() {
  return new Promise(async function (resolve, reject) {
    await uploadApp(props.App_Name);
    log('INFO', "DONE DEPLOYING: " + props.App_Name);
    resolve();

  });
}

// Function to publish the cloud starter
function publish() {
  return new Promise(async function (resolve, reject) {
    await publishApp(props.App_Name);
    log('INFO', 'APP PUBLISHED: ' + props.App_Name);
    log('INFO', "LOCATION: https://eu.liveapps.cloud.tibco.com/webresource/apps/" + props.App_Name + "/index.html#/starterApp/home");
    resolve();
  });
}

// Function to get the cloud library sources from GIT
getCLgit = function(){
  return getGit(props.GIT_Source_TCSTLocation, props.TCSTLocation, props.GIT_Tag_TCST);
}

// Function that injects the sources of the library into this project
function injectLibSources() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Injecting Lib Sources');
    //run('mkdir tmp');
    mkdirIfNotExist('./projects/tibco-tcstk');
    copyDir('./tmp/TCSDK-Angular/projects/tibco-tcstk', './projects/tibco-tcstk');
    //use debug versions
    copyFile('./tsconfig.debug.json', './tsconfig.json');
    copyFile('./angular.debug.json', './angular.json');
    copyFile('./package.debug.json', './package.json');
    //do NPM install
    npmInstall('./');
    npmInstall('./', 'lodash-es');
    log('INFO', 'Now you can debug the cloud library sources in your browser !!');
    resolve();
  });
}

// Function to go back to the compiled versions of the libraries
function undoLibSources() {
  return new Promise(function (resolve, reject) {
    log('INFO', 'Undo-ing Injecting Lib Sources');
    //Move back to Angular build files
    copyFile('./tsconfig.build.json', './tsconfig.json');
    copyFile('./angular.build.json', './angular.json');
    copyFile('./package.build.json', './package.json');
    //Delete Project folder
    deleteFolder('./projects/');
    npmInstall('./');
    resolve();
  });
}

gulp.task('help', main);
main.description = 'Displays this message';
gulp.task('default', main);
main.description = 'Displays this message';
gulp.task('show-cloud', showClaims);
showClaims.description = 'Shows basic information on your cloud login. (use this to test your cloud login details)';
gulp.task('show-apps', showAvailableApps);
showAvailableApps.description = 'Shows all the applications that are deployed in the cloud and their versions.';
gulp.task('build', build);
build.description = 'Build the ZIP file for your project.';
gulp.task('deploy', deploy);
deploy.description = 'Deploys your application to the cloud.';
gulp.task('publish', publish);
publish.description = 'Publishes the latest version of your application.';
gulp.task('build-deploy-publish', gulp.series('build', 'deploy', 'publish'));

gulp.task('get-cloud-libs-from-git', getCLgit);
getCLgit.description = 'Get the library sources from GIT';
gulp.task('format-project-for-lib-sources', injectLibSources);
injectLibSources.description = '(INTERNAL TASK) Used to reformat your project so you can work with the library sources (for debugging)';
gulp.task('clean', cleanTemp);
cleanTemp.description = '(INTERNAL TASK) Used to clean the temporary folders';
gulp.task('inject-lib-sources', gulp.series('clean', 'get-cloud-libs-from-git', 'format-project-for-lib-sources', 'clean'));
gulp.task('undo-lib-sources', undoLibSources);
undoLibSources.description = 'UNDO task for inject-lib-sources, use this when you want to go back to normal mode';

function main() {
  return new Promise(function (resolve, reject) {
    console.log('                               # |-------------------------------------------|');
    console.log('                               # |  *** T I B C O    C L O U D   C L I ***   |');
    console.log('                               # |             V1.0 (8-5-2019)               |');
    console.log('                               # |-------------------------------------------|');
    log('INFO' , 'GULP DETAILS:');
    run('gulp --version');
    log('INFO' , 'Choose a task from the following list:');
    run('gulp -T');
    checkPW();
    resolve();
  });
};


