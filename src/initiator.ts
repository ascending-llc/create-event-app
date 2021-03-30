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

async function handleMixpanel (dist:string, config) {
  const pwd = process.cwd()
  try {
    // Handle Mixpanel action
    await fs.copy(path.join(__dirname, '../components/Mixpanel.js'), `${dist}/src/components/util/Mixpanel.js`)
    console.log('success!')
    // Handle environment variable
    fs.appendFile(`${dist}/.env.uat`, '\nREACT_APP_MIXPANEL_ID=' + config.mixPanelId)
    fs.appendFile(`${dist}/.env.prod`, '\nREACT_APP_MIXPANEL_ID=' + config.mixPanelId)

  } catch (err) {
    console.error(err)
  }

  // Import in Routes.jsx
  fs.readFile(`${dist}/src/Routes.jsx`, function read(err, data) {
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
        var str = "\n  React.useEffect(() => {\n    Mixpanel.track(window.location.pathname);\n    Mixpanel.register({'path': window.location.pathname});\n  }, [location]);\n";
        var idx = file_content.indexOf('export default function Routes() {') + 'export default function Routes() {'.length;
        var result = file_content.slice(0, idx) + str + file_content.slice(idx);
        fs.writeFile(`${dist}/src/Routes.jsx`, result, function (err) {
          if (err) throw err;
        });
      });
    });
  });

  // Add mixpanel package
  fs.readFile(`${dist}/package.json`, function read(err, data) {
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
  fs.readFile(`${dist}/src/App.jsx`, function read(err, data) {
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
        fs.writeFile(`${dist}/src/app.jsx`, result, function (err) {
          if (err) throw err;
        });
      });
    });
  });
}

const initiator = async ({ path, branch, from, dist }: Download, config) => {
  // console.log('metadata: ' + JSON.stringify(config))
  let dlFrom = ''
  let result:DownloadResult
  if (fs.existsSync(dist)) {
    console.log("Project already exists");
    return;
  }
  if (from === 'GitHub' || from === 'GitLab' || from === 'Bitbucket') {
    dlFrom = from.toLocaleLowerCase() + ':' + path + '#' + branch
    result = await doDownload(dlFrom, dist)
    await handleProjectName(dist, config)
  } else if (from.startsWith('http')) {
    dlFrom = 'direct:' + from
    result = await doDownload(dlFrom, dist)
  } else {
    dlFrom = 'others:' + from
    result = await doCopy(dlFrom.replace('others:', ''), dist)
  }
  if (config.enableMixpanel) {
    console.log("Mixpanel enabled")
    handleMixpanel(dist, config)
  } else {
    console.log("Mixpanel not enabled")
  }

  console.log(result.status ? chalk.green(result.msg) : chalk.red(result.msg))
}

export default initiator
