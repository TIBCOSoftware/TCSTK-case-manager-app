// Package Definitions
const execSync = require('child_process').execSync;
const syncClient = require('sync-rest-client');
const git = require('gulp-git');
const fs = require('file-system');
const rimraf = require("rimraf");
const PropertiesReader = require('properties-reader');
const propertiesF = PropertiesReader('tibco-cloud.properties');
const propsF = propertiesF.path();

// Create a directory if it does not exists
mkdirIfNotExist = function (dir) {
  //var dir = './tmp';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

// Clean temp folder
cleanTemp = function () {
  log(INFO, 'Cleaning Temp Directory...');
  return deleteFolder(propsF.Workspace_TMPFolder);

}

deleteFolder = function (folder) {
  return new Promise(function (resolve, reject) {
    log(INFO, 'Deleting Folder: ' + folder);
    rimraf.sync(folder);
    resolve();
  });
}

// Run an OS Command
run = function (command) {
  return new Promise(function (resolve, reject) {
    log(DEBUG, 'Executing Command: ' + command);
    execSync(
      command,
      {stdio: 'inherit'}
    );
    resolve();
  });
}

//Function that determines which cloud login method to use
// function to login to the cloud
var loginURL = propsF.Cloud_URL + propsF.loginURE;
function cLogin() {
  checkPW();
  return cloudLoginV3(propsF.CloudLogin.tenantID, propsF.CloudLogin.clientID, propsF.CloudLogin.email, propsF.CloudLogin.pass, loginURL);
}

// Function that logs into the cloud and returns a cookie
function cloudLoginV3(tenantID, clientID, email, pass, TCbaseURL) {
  log(DEBUG, 'cloudLoginV3]  tenantID=' + tenantID + ' clientID=' + clientID + ' email=' + email + ' TCbaseURL=' + TCbaseURL);
  var postForm = 'TenantId=' + tenantID + '&ClientID=' + clientID + '&Email=' + email + '&Password=' + pass;
  log(INFO, 'Calling: ' + TCbaseURL);
  //log(DEBUG,'With Form: ' + postForm);
  var response = syncClient.post(encodeURI(TCbaseURL), {
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    payload: postForm
  });
  var loginCookie = response.headers['set-cookie'];
  logO(DEBUG, loginCookie);
  var rxd = /domain=(.*?);/g;
  var rxt = /tsc=(.*?);/g;
  var re = {"domain": rxd.exec(loginCookie)[1], "tsc": rxt.exec(loginCookie)[1]};
  logO(DEBUG, re.domain);
  logO(DEBUG, re.tsc);
  logO(DEBUG, re);
  log(INFO, 'Login Successful...');
  return re;
}

// Function that builds the zip for deployment
buildCloudStarterZip = function (cloudStarter) {
  return new Promise(function (resolve, reject) {
    const csURL = '/webresource/apps/' + cloudStarter + '/';
    run('ng build --prod --base-href ' + csURL + 'index.html --deploy-url ' + csURL);
    //copyFile('./tmp/' + cloudStarter + '/tsconfig.build.json', './tmp/' + cloudStarter + '/tsconfig.json');
    run('cd ./dist/ && zip -r ./../build/' + cloudStarter + '.zip .');
    resolve();
  });
}

// function that shows all the availible applications in the cloud
const getAppURL = propsF.Cloud_URL + propsF.appURE + '?%24top=200';
showAvailableApps = function (showTable) {
  var doShowTable = (typeof showTable === 'undefined') ? false : showTable;
  //return new Promise(function (resolve, reject) {
    var lCookie = cLogin();
    //log(INFO, 'Login Cookie: ', lCookie);
    var response = syncClient.get(getAppURL, {
      headers: {
        "accept": "application/json",
        "cookie": "tsc=" + lCookie.tsc + "; domain=" + lCookie.domain
      }
    });
    //console.log(response.body);
    //console.table(response.body);
    var apps = {};
    for (var app in response.body) {
      var appTemp = {};
      var appN = parseInt(app) + 1;
      //log(INFO, appN + ') APP NAME: ' + response.body[app].name  + ' Published Version: ' +  response.body[app].publishedVersion + ' (Latest:' + response.body[app].publishedVersion + ')') ;
      appTemp['APP NAME'] = response.body[app].name;
      //appTemp['LINK'] = 'https://eu.liveapps.cloud.tibco.com/webresource/apps/'+response.body[app].name+'/index.html';
      // TODO: Use the API (get artifacts) to find an index.htm(l) and provide highest
      // TODO: Use right eu / us link
      var publV = parseInt(response.body[app].publishedVersion);
      appTemp['PUBLISHED VERSION'] = publV;
      var latestV = parseInt(response.body[app].latestVersion);
      appTemp['LATEST VERSION'] = latestV;
      //appTemp['PUBLISHED / LATEST VERSION'] = '(' + publV + '/' + latestV + ')';
      var latestDeployed = false;
      if (publV == latestV) {
        latestDeployed = true;
      }
      appTemp['LATEST DEPLOYED'] = latestDeployed;
      apps[appN] = appTemp;
      var created = new Date(response.body[app].creationDate);
      var options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
      var optionsT = {hour: 'numeric'};
      appTemp['CREATED'] = created.toLocaleDateString("en-US", options);
      //appTemp['CREATED TIME'] = created.toLocaleTimeString();
      var lastModified = new Date(response.body[app].lastModifiedDate);
      //appTemp['LAST MODIFIED'] = lastModified.toLocaleDateString("en-US", options);
      //appTemp['LAST MODIFIED TIME'] = lastModified.toLocaleTimeString();
      var now = new Date();
      appTemp['AGE(DAYS)'] = Math.round((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      appTemp['LAST MODIFIED(DAYS)'] = Math.round((now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24));
   }
    //logO(INFO,apps);
    if(doShowTable) console.table(apps);
    return response.body;
   // resolve();
 // });
};

showApps = function(){
  return new Promise(function (resolve, reject) {
    showAvailableApps(true);
    resolve();
  });
}


// Function to show claims for the configured user
const getClaimsURL = propsF.Cloud_URL + propsF.Claims_URE;
showClaims = function () {
  return new Promise(function (resolve, reject) {
    var lCookie = cLogin();
    log(DEBUG, 'Login Cookie: ', lCookie);
    var response = syncClient.get(getClaimsURL, {
      headers: {
        "accept": "application/json",
        "cookie": "tsc=" + lCookie.tsc + "; domain=" + lCookie.domain
      }
    });
    logO(INFO, response.body);
    resolve();
  });
};

function getCloud(url){
  const lCookie = cLogin();
  log(DEBUG, 'Login Cookie: ', lCookie);
  const response = syncClient.get(url, {
    headers: {
      "accept": "application/json",
      "cookie": "tsc=" + lCookie.tsc + "; domain=" + lCookie.domain
    }
  });
  var re = response.body;
  //let re = Object.assign({}, response.body);
  //logO(INFO, re);
  return re;
}

const getApplicationDetailsURL = propsF.Cloud_URL + propsF.appURE;
//const getApplicationDetailsURL = 'https://eu.liveapps.cloud.tibco.com/webresource/v1/applications/AppMadeWithSchematic3/applicationVersions/1/artifacts/';
getApplicationDetails = function (application, version, showTable) {
    var doShowTable = (typeof showTable === 'undefined') ? false : showTable;
    var details = {};
    //console.log(getApplicationDetailsURL +  application + '/applicationVersions/' + version + '/artifacts/');
    const appDet =  getCloud(getApplicationDetailsURL +  application + '/applicationVersions/' + version + '/artifacts/');
    //logO(INFO, appDet);
    var i = 0;
    for (var det in appDet) {
      var appTemp = {};
      appN = i;
      i++;
      appTemp['DETAIL NAME'] = appDet[det].name;
      details[appN] = appTemp;
    }
    if(doShowTable) console.table(details);
    return appDet;
};

// Function to upload a zip to the LiveApps ContentManagment API
uploadApp = function (application) {
  return new Promise(function (resolve, reject) {
    var lCookie = cLogin();
    let formData = new require('form-data')();
    log(INFO, 'UPLOADING APP: ' + application);
    var uploadAppLocation = '/webresource/v1/applications/' + application + '/upload/';
    //formData.append('key1', 1);
    // formData.setHeader("cookie", "tsc="+lCookie.tsc + "; domain=" + lCookie.domain);
    formData.append('appContents', require("fs").createReadStream('./build/' + application + '.zip'));
    let query = require('https').request({
      hostname: propsF.cloudHost,
      path: uploadAppLocation,
      method: 'POST',
      headers: {
        "cookie": "tsc=" + lCookie.tsc + "; domain=" + lCookie.domain,
        'Content-Type': 'multipart/form-data; charset=UTF-8'
      },
    }, (res) => {
      let data = '';
      res.on("data", (chunk) => {
        data += chunk.toString('utf8');
      });
      res.on('end', () => {
        console.log(data);
        resolve();
      })
    });

    query.on("error", (e) => {
      console.error(e);
      resolve();
    });

    formData.pipe(query);

  });
}

// Function to publish the application to the cloud
publishApp = function (application) {
  return new Promise(function (resolve, reject) {
    var lCookie = cLogin();
    // var lCookie = cloudLoginV3();
    // console.log('Login Cookie: ' , lCookie);
    var publishLocation = propsF.Cloud_URL + 'webresource/v1/applications/' + application + '/';
    var response = syncClient.put(publishLocation, {
      headers: {
        "accept": "application/json",
        "cookie": "tsc=" + lCookie.tsc + "; domain=" + lCookie.domain
      }
    });
    console.log(response.body);
    resolve();
  });
}


// Get the TIBCO Cloud Starter Development Kit from GIT
getGit = function (source, target, tag) {
  log(INFO, 'Getting GIT) Source: ' + source + ' Target: ' + target + ' Tag: ' + tag);
  // git clone --branch bp-baseV1 https://github.com/TIBCOSoftware/TCSDK-Angular
  if (tag == 'LATEST') {
    return git.clone(source, {args: target}, function (err) {
    });
  } else {
    return git.clone(source, {args: '--branch ' + tag + ' ' + target}, function (err) {
    });
  }
}

// Function to install NPM packages
npmInstall = function (location, package) {
  return new Promise(function (resolve, reject) {
    if (package != null) {
      run('cd ' + location + ' && npm install ' + package);
    } else {
      run('cd ' + location + ' && npm install');
    }

    resolve();
  });
}

// Function to copy a directory
copyDir = function (fromDir, toDir) {
  log(INFO, 'Copying Directory from: ' + fromDir + ' to: ' + toDir);
  fs.rmdirSync(toDir);
  fs.copySync(fromDir, toDir);
}

// Function to copy a file
copyFile = function (fromFile, toFile) {
  log(INFO, 'Copying File from: ' + fromFile + ' to: ' + toFile);
  fs.copyFileSync(fromFile, toFile);
}

// Function to delete a file but does not fail when the file does not exits
deleteFile = function (file) {
  log(INFO, 'Deleting File: ' + file);
  try {
    fs.unlinkSync(file);
    //file removed
  } catch (err) {
    log(ERROR, 'Maybe file does not exist ?... (' + err.code + ')');
    //console.log(err)
  }

}


checkPW = function(){
  if(propsF.CloudLogin.pass == null || propsF.CloudLogin.pass == ''){
    log(ERROR, 'Please provide your password to login to the tibco cloud in the file tibco-cloud.properties (for property: CloudLogin.pass)');
    process.exit();
  }
}

// Log function
const INFO = 'INFO';
const DEBUG = 'DEBUG';
const ERROR = 'ERROR';
const useDebug = (propsF.Use_Debug == 'true');
log = function (level, message) {
  if (!(level == DEBUG && !useDebug)) {
    var timeStamp = new Date();
    //console.log('(' + timeStamp + ')[' + level + ']  ' + message);
    console.log('TIBCO CLOUD CLI] -' + level + '- ' + message);
  }
}
logO = function (level, message) {
  if (!(level == DEBUG && !useDebug)) {
    console.log(message);
  }
}
