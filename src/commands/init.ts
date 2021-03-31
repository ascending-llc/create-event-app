import { prompt } from 'inquirer'
import DB from '../db'
import listTable from '../table'
import initiator from '../initiator'

async function initTemplate () {
  const tplList:any = await DB.find({})
  listTable(tplList, '', false)

  const questions = [
    {
      type: 'rawlist',
      name: 'tplName',
      message: 'Select a template:',
      choices: () => tplList.map(tpl => {
        return {
          name: tpl.name,
          value: tpl.name,
        }
      })
    },
    {
      type: 'input',
      name: 'project',
      message: 'What is your project name?',
      // default: (lastAnswer) => {
      //   return lastAnswer.tplName
      // }
    },
    {
      type: 'confirm',
      name: 'enableMixpanel',
      message: 'Enable Mixpanel?',
    }, 
    {
      type: 'input',
      name: 'mixPanelId',
      message: 'What is your Mixpanel ID?',
      when: function (answers) {
        return answers.enableMixpanel;
      },
    },
    {
      type: 'confirm',
      name: 'enableGA',
      message: 'Enable Google Analytics?',
    }, 
    {
      type: 'input',
      name: 'GAId',
      message: 'What is your Google Analytics ID?',
      when: function (answers) {
        return answers.enableGA;
      },
    },
    {
      type: 'confirm',
      name: 'enableSSO',
      message: 'Enable Single Sign On?',
    },
    {
      type: 'input',
      name: 'SSOClientId',
      message: 'What is your Client ID?',
      when: function (answers) {
        return answers.enableSSO;
      },
    },
    {
      type: 'input',
      name: 'SSOTenantId',
      message: 'What is your Tenant ID?',
      when: function (answers) {
        return answers.enableSSO;
      },
    },
  ]

  prompt(questions)
    .then(async ({ tplName, project, enableMixpanel, mixPanelId, enableSSO, enableGA, GAId, SSOClientId, SSOTenantId }) => {
    // console.log(`${tplName}, ${project}, ${enableMixpanel}, ${mixPanelId} `)
    const tpl = tplList.filter(({ name }) => name === tplName)[0]
    const { path, branch, from }:any = tpl
    const pwd = process.cwd()
    const config = {
      'projectName': project,
      'enableMixpanel': enableMixpanel,
      'mixPanelId': mixPanelId,
      'enableSSO': enableSSO,
      'enableGA': enableGA,
      'GAId': GAId,
      'SSOClientId': SSOClientId,
      'SSOTenantId': SSOTenantId
    }
    initiator({ path, branch, from, dist: `${pwd}/${project}` }, config)
  })
}

export default initTemplate
