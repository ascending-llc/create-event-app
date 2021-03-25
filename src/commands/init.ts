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
      name: 'enableSignIn',
      message: 'Do you want to add a sign in page?',
    }, 
  ]

  prompt(questions)
    .then(async ({ tplName, project, enableMixpanel, mixPanelId, enableSignIn }) => {
    console.log(`${tplName}, ${project}, ${enableMixpanel}, ${mixPanelId} `)
    const tpl = tplList.filter(({ name }) => name === tplName)[0]
    const { path, branch, from }:any = tpl
    const pwd = process.cwd()
    const config = {
      'enableMixpanel': enableMixpanel,
      'mixPanelId': mixPanelId,
      'enableSignIn': enableSignIn
    }
    initiator({ path, branch, from, dist: `${pwd}/${project}` }, config)
  })
}

export default initTemplate
