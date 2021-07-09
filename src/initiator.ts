import { Download, DownloadResult } from "./types"
import chalk from 'chalk'
import ora from 'ora'

const path = require('path');
const download = require('download-git-repo')
const ncp = require('ncp').ncp
const spinner = ora('Downloading template...')
const fs = require('fs-extra')

const doDownload = (from:string, dist:string):Promise<DownloadResult> => {
  console.log(from, dist)
  spinner.start()
  return new Promise((resolve, reject) => {
    download(from, dist, err => {
      if (err) {
        reject({
          status: 0,
          msg: err
        })
      }
      spinner.stop()
      resolve({
        status: 1,
        msg: `New project has been initialized successfully! Locate in \n${dist}`
      })
    })
  })
}

const doCopy = (from:string, dist:string):Promise<DownloadResult> => {
  console.log(from, dist)
  spinner.start()
  return new Promise((resolve, reject) => {
    ncp(from, dist, err => {
      if (err) {
        reject({
          status: 0,
          msg: err
        })
      }
      spinner.stop()
      resolve({
        status: 1,
        msg: `New project has been initialized successfully! Locate in \n${dist}`
      })
    })
  })
}

const handleProjectName = (dist:string, config) => {
  console.log(config.projectName);
  return new Promise((resolve, reject) => {
    fs.readFile(`${dist}/package.json`, function read(err, data) {
      if (err) {
         throw err;
      }
      var file_content = data.toString();
      var str = config.projectName;
      var idx = file_content.indexOf('"name": ') + 9;
      var result = file_content.slice(0, idx) + str + file_content.slice(idx);
      fs.writeFile(`${dist}/package.json`, result, function (err) {
        if (err) throw err;
      });
    });
    resolve("finished")
  })
}

const handleSSO = async (dist:string, config) => {
  if (!config.enableSSO) {
    return;
  } else {
    await fs.copy(path.join(__dirname, '../tamplates/SSO/Azure/AuthConfig.js'), `${dist}/src/components/Auth/AuthConfig.js`);
    await fs.copy(path.join(__dirname, '../tamplates/SSO/Azure/AuthGuard.js'), `${dist}/src/components/Auth/AuthGuard.js`);
    await fs.copy(path.join(__dirname, '../tamplates/SSO/Azure/SignInButton.jsx'), `${dist}/src/components/Auth/SignInButton.jsx`);
    await fs.copy(path.join(__dirname, '../tamplates/SSO/Azure/SignOutButton.jsx'), `${dist}/src/components/Auth/SignOutButton.jsx`);
    await fs.copy(path.join(__dirname, '../tamplates/SSO/Azure/SignInSignOutButton.jsx'), `${dist}/src/components/Auth/SignInSignOutButton.jsx`);

    // Create environment variables
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_SSO_CLIENT_ID=' + config.SSOClientId);
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_SSO_TENANT_ID=' + config.SSOTenantId);
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_SSO_CLOUD_ID=https://login.microsoftonline.com');
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_SSO_POST_LOGOUT_REDIRECT_URL=');
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_SSO_CLIENT_ID=');
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_SSO_TENANT_ID=');
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_SSO_CLOUD_ID=https://login.microsoftonline.com'); 
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_SSO_POST_LOGOUT_REDIRECT_URL=');

    // Add msal packages
    await fs.readFile(`${dist}/package.json`, function read(err, data) {
      if (err) {
         throw err;
      }
      var file_content = data.toString();
      var str = "\n    \"@azure/msal-browser\": \"^2.14.2\",";
      str += "\n    \"@azure/msal-react\": \"^1.0.0\",";
      var idx = file_content.indexOf('"dependencies": {') + '"dependencies": {'.length;
      var result = file_content.slice(0, idx) + str + file_content.slice(idx);
      fs.writeFile(`${dist}/package.json`, result, function (err) {
        if (err) throw err;
      });
    });

    // Imports in App.jsx
    await fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
      if (err) throw err;
      var file_content = data.toString();
      var str = "import { useHistory } from 'react-router-dom';\n";
      str += "import { MsalProvider } from '@azure/msal-react';\n;"
      str += "import { CustomNavigationClient } from './components/utils/NavigationClient';\n"
      var result = str + file_content;
      fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
        if (err) throw err;
        // Add msal instance as prop
        fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
          if (err) throw err;
          var file_content = data.toString();
          var str = "{ pca }";
          var idx = file_content.indexOf('function App(') + 'function App('.length;
          var result = file_content.slice(0, idx) + str + file_content.slice(idx);
          fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
            if (err) throw err;
            // Configure msal to custom navigation client
            fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
              if (err) throw err;
              var file_content = data.toString();
              var str = "";
              str += "\n\n\tconst history = useHistory();";
              str += "\n\tconst navigationClient = new CustomNavigationClient(history);";
              str += "\n\tpca.setNavigationClient(navigationClient);\n"
              var idx = file_content.indexOf('function App({ pca }) {') + 'function App({ pca }) {'.length;
              var result = file_content.slice(0, idx) + str + file_content.slice(idx);
              fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
                if (err) throw err;
                // Render MsalProvider in App
                fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
                  if (err) throw err;
                  var file_content = data.toString();
                  var str = "<MsalProvider instance={pca}>\n\t\t";
                  var str2 = "\n\t\t</MsalProvider>";
                  var idx = file_content.indexOf('<div');
                  var idx2 = file_content.indexOf('</div>') + '</div>'.length;
                  var result = file_content.slice(0, idx) + str + file_content.slice(idx, idx2) + str2 + file_content.slice(idx2);
                  fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
                    if (err) throw err;
                  });
                });
              });
            });
          });
        });
      });
    });

    // Imports in index.jsx
    await fs.readFile(`${dist}/src/index.jsx`, function read(err, data) {
      if (err) throw err;
      var file_content = data.toString();
      var str ="import { PublicClientApplication, EventType } from '@azure/msal-browser';\n";
      str += "import { msalConfig } from './components/Auth/AuthConfig';\n";
      var result = str + file_content;
      fs.writeFile(`${dist}/src/index.jsx`, result, function(err) {
        if (err) throw err;
        // Init msal instance, set up account logic
        fs.readFile(`${dist}/src/index.jsx`, function read(err, data) {
          if (err) throw err;
          var file_content = data.toString();
          var str = "export const msalInstance = new PublicClientApplication(msalConfig);";
          str += "\n\nconst accounts = msalInstance.getAllAccounts();\n\tif (accounts.length > 0) {\n\tmsalInstance.setActiveAccount(accounts[0]);\n}";
          str += "\n\nmsalInstance.addEventCallback((event) => {\n\tif (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {\n\t\tconst account = event.payload.account;\n\t\tmsalInstance.setActiveAccount(account);\n\t}\n});\n\n";
          var idx = file_content.indexOf('ReactDOM.render');
          var result = file_content.slice(0, idx) + str + file_content.slice(idx);
          fs.writeFile(`${dist}/src/index.jsx`, result, function (err) {
            if (err) throw err;
            // Pass msal instance into App
            fs.readFile(`${dist}/src/index.jsx`, function read(err, data) {
              if (err) throw err;
              var file_content = data.toString();
              var str = " pca={msalInstance}";
              var idx = file_content.indexOf('<App') + '<App'.length;
              var result = file_content.slice(0, idx) + str + file_content.slice(idx);
              fs.writeFile(`${dist}/src/index.jsx`, result, function (err) {
                if (err) throw err;
              });
            });
          });
        });
      });
    });
    
    // Imports in Routes.jsx
    await fs.readFile(`${dist}/src/Routes.jsx`, function read(err, data) {
      if (err) throw err;
      var file_content = data.toString();
      var str = "import AuthGuard from './components/Auth/AuthGuard';\n"
      var result = str + file_content;
      fs.writeFile(`${dist}/src/Routes.jsx`, result, function (err) {
        if (err) throw err;
        // Put AuthGuard into Switch
        fs.readFile(`${dist}/src/Routes.jsx`, function read(err, data) {
          if (err) throw err;
          var file_content = data.toString();
          var str = "\n\t\t\t<AuthGuard defaultComponent={Home}>\n\t\t\t</AuthGuard>";
          var idx = file_content.indexOf('<Switch>') + '<Switch>'.length;
          var result = file_content.slice(0, idx) + str + file_content.slice(idx);
          fs.writeFile(`${dist}/src/Routes.jsx`, result, function (err) {
            if (err) throw err;
          });
        });
      });
    });

      
  }
}

const handleGA = async (dist:string, config) => {
  if (!config.enableGA) {
    return;
  } else {
    await fs.copy(path.join(__dirname, '../tamplates/gaScript.js'), `${dist}/src/components/util/gaScript.js`)
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_GA_ID=' + config.GAId)
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_GA_ID=')
    
    // Import gaScript
    await fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
      if (err) {
        throw err;
      }
      var file_content = data.toString();
      var str = "import gaScript from './components/util/gaScript';\n";
      var result = str + file_content;
      fs.writeFile(`${dist}/src/App.jsx`, result, function initGAScript(err) {
        if (err) throw err;
        // Init GA
        fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
          if (err) {
            throw err;
          }
          var file_content = data.toString();
          var str = "\n  gaScript(process.env.REACT_APP_GA_ID);";
          var idx = file_content.indexOf('function App() {') + 'function App() {'.length;
          var result = file_content.slice(0, idx) + str + file_content.slice(idx);
          fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
            if (err) throw err;
          });
        });
      });
    });
  }
}

async function handleMixpanel (dist:string, config) {
  if (!config.enableMixpanel) {
    return;
  } else {
    const pwd = process.cwd()
  try {
    // Handle Mixpanel action
    fs.copy(path.join(__dirname, '../tamplates/Mixpanel.js'), `${dist}/src/components/util/Mixpanel.js`)
    fs.copy(path.join(__dirname, '../tamplates/device.js'), `${dist}/src/components/util/device.js`)
    
    // Handle environment variable
    await fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_MIXPANEL_ID=' + config.mixPanelId)
    await fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_MIXPANEL_ID=')

  } catch (err) {
    console.error(err)
  }

  // Import in Routes.jsx
  await fs.readFile(`${dist}/src/Routes.jsx`, function read(err, data) {
    if (err) {
       throw err;
    }
    var file_content = data.toString();
    var str = "import { Mixpanel } from './components/util/Mixpanel';\n";
    var idx = 0
    var result = str + file_content.slice(idx);
    fs.writeFile(`${dist}/src/Routes.jsx`, result, function trackInRoute(err) {
      if (err) throw err;
        // Track in Route
        fs.readFile(`${dist}/src/Routes.jsx`, function read(err, data) {
        if (err) {
          throw err;
        }
        var file_content = data.toString();
        var str = "\n  React.useEffect(() => {\n    Mixpanel.track(window.location.pathname);\n    Mixpanel.register({ path: window.location.pathname });\n  }, [location]);\n";
        var idx = file_content.indexOf('const location = useLocation();') + 'const location = useLocation();'.length;
        var result = file_content.slice(0, idx) + str + file_content.slice(idx);
        fs.writeFile(`${dist}/src/Routes.jsx`, result, function (err) {
          if (err) throw err;
        });
      });
    });
  });

  // Add mixpanel package
  await fs.readFile(`${dist}/package.json`, function read(err, data) {
    if (err) {
       throw err;
    }
    var file_content = data.toString();
    var str = "\n    \"mixpanel-browser\": \"^2.39.0\",";
    var idx = file_content.indexOf('"dependencies": {') + '"dependencies": {'.length;
    var result = file_content.slice(0, idx) + str + file_content.slice(idx);
    fs.writeFile(`${dist}/package.json`, result, function (err) {
      if (err) throw err;
    });
  });

  // Import Mixpanel
  await fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
    if (err) {
       throw err;
    }
    var file_content = data.toString();
    var str = "import mixpanel from 'mixpanel-browser';\n";
    var idx = 0;
    var result = str + file_content;
    fs.writeFile(`${dist}/src/App.jsx`, result, function initMixpanel(err) {
      if (err) throw err;
      // Init Mixpanel
      fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
        if (err) {
          throw err;
        }
        var file_content = data.toString();
        var str = "\n  mixpanel.init(process.env.REACT_APP_MIXPANEL_ID);";
        var idx = file_content.indexOf('function App() {') + 'function App() {'.length;
        var result = file_content.slice(0, idx) + str + file_content.slice(idx);
        fs.writeFile(`${dist}/src/App.jsx`, result, function (err) {
          if (err) throw err;
        });
      });
    });
  });
  }
}

const initiator = async ({ path, branch, from, dist }: Download, config) => {
  // console.log('metadata: ' + JSON.stringify(config))
  let dlFrom = '';
  let result:DownloadResult;
  if (fs.existsSync(dist)) {
    console.log("Project already exists");
    return;
  }
  if (from === 'GitHub' || from === 'GitLab' || from === 'Bitbucket') {
    dlFrom = from.toLocaleLowerCase() + ':' + path + '#' + branch;
    result = await doDownload(dlFrom, dist);
    await handleProjectName(dist, config);
  } else if (from.startsWith('http')) {
    dlFrom = 'direct:' + from;
    result = await doDownload(dlFrom, dist);
  } else {
    dlFrom = 'others:' + from;
    result = await doCopy(dlFrom.replace('others:', ''), dist);
  }
  await handleMixpanel(dist, config);
  await handleGA(dist, config);
  await handleSSO(dist, config);

  console.log(result.status ? chalk.green(result.msg) : chalk.red(result.msg))
}

export default initiator
