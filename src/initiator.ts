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
async function copyFiles (dist:string) {
  const pwd = process.cwd()
  try {
    // await fs.copy(`${pwd}/preview/add.gif`, `${dist}/add.gif`)
    await fs.copy(path.join(__dirname, '../components/Mixpanel.js'), `${dist}/src/components/util/Mixpanel.js`)
    console.log('success!')
  } catch (err) {
    console.error(err)
  }
}
const initiator = async ({ path, branch, from, dist }: Download, config) => {
  console.log('metadata: ' + JSON.stringify(config))
  if (config.enableMixpanel) {
    console.log("Mixpanel enabled")
    copyFiles(dist)

  } else {
    console.log("Mixpanel not enabled")
  }
  let dlFrom = ''
  let result:DownloadResult
  if (from === 'GitHub' || from === 'GitLab' || from === 'Bitbucket') {
    dlFrom = from.toLocaleLowerCase() + ':' + path + '#' + branch
    result = await doDownload(dlFrom, dist)
  } else if (from.startsWith('http')) {
    dlFrom = 'direct:' + from
    result = await doDownload(dlFrom, dist)
  } else {
    dlFrom = 'others:' + from
    result = await doCopy(dlFrom.replace('others:', ''), dist)
  }

  console.log(result.status ? chalk.green(result.msg) : chalk.red(result.msg))
}

export default initiator
