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
      message: 'What is your project name:',
      // default: (lastAnswer) => {
      //   return lastAnswer.tplName
      // }
    },
    {
      type: 'confirm',
      name: 'enableMixpanel',
      message: 'Do you want to enable Mixpanel?',
    }, 
    {
      type: 'input',
      name: 'mixPanelId',
      message: 'What is your Mixpanel ID:',
      when: function (answers) {
        return answers.enableMixpanel;
      },
    },
    {
      type: 'confirm',
      name: 'enableGA',
      message: 'Do you want to enable Google Analytics?',
    }, 
    {
      type: 'input',
      name: 'GAId',
      message: 'What is your Google Analytics ID:',
      when: function (answers) {
        return answers.enableGA;
      },
    },
    // {
    //   type: 'confirm',
    //   name: 'enableSSO',
    //   message: 'Do you want to add a sign in page?',
    // }, 
  ]

  prompt(questions)
    .then(async ({ tplName, project, enableMixpanel, mixPanelId, enableSSO, enableGA, GAId }) => {
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
      'GAId': GAId
    }
    initiator({ path, branch, from, dist: `${pwd}/${project}` }, config)
  })
}

export default initTemplate
