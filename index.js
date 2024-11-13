#!/usr/bin/env node

import prompts from 'prompts'
import { exec, spawnSync } from 'node:child_process'
import { red, green, bold } from 'kleur/colors'
const log = console.log

// 定义问题
const questions = [
  {
    type: 'text',
    name: 'projectName',
    message: '请输入工程名称',
  },
  {
    type: 'confirm',
    name: 'isTemplate',
    message: '是否使用内置模板',
    initial: true,
  },
  {
    type: (prev) => (prev ? 'select' : null),
    name: 'templateType',
    message: '请选择模板类型',
    choices: [
      { title: 'PC', value: 'pc', description: '这是一个默认的后台管理系统模板' },
      { title: 'H5', value: 'h5', description: '这是一个默认的H5系统模板' },
    ],
    initial: 0,
  },
]
const templateRepo = {
  pc: 'https://github.com/tuyongtao-T/vue3-admin-ts.git',
}

async function init() {
  try {
    log(green('准备执行脚手架命令...'))
    const result = await prompts(questions)
    if (result.isTemplate) {
      log(green('准备拉取远程模板...'))
      exec(`git clone ${templateRepo[result.templateType]} ${result.projectName}`)
    } else {
      log(green('准备切换到create-vue...'))
      const userAgent = process.env.npm_config_user_agent ?? ''
      const packageManager = /pnpm/.test(userAgent)
        ? 'pnpm'
        : /yarn/.test(userAgent)
          ? 'yarn'
          : /bun/.test(userAgent)
            ? 'bun'
            : 'npm'
      spawnSync(`${packageManager}`, ['create', 'vue@latest', result.projectName], { stdio: 'inherit' })
    }
    
  } catch (error) {
    console.log(error)
  }
}

init().catch((error) => {
  log(bold(error))
  process.exit(1)
}).finally(() => {
  log(green('创建成功...'))
})
