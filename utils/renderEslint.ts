import * as fs from 'node:fs'
import * as path from 'node:path'

import createESLintConfig from '@vue/create-eslint-config'

import sortDependencies from './sortDependencies'
import deepMerge from './deepMerge'


export default function renderEslint(
  rootDir,
  {
    needsTypeScript,
    needsOxlint,
    needsPrettier,
  },
) {
  const additionalConfigs = []

  const { pkg, files } = createESLintConfig({
    styleGuide: 'default',
    hasTypeScript: needsTypeScript,
    needsOxlint,
    // Theoretically, we could add Prettier without requring ESLint.
    // But it doesn't seem to be a good practice, so we just let createESLintConfig handle it.
    needsPrettier,
    additionalConfigs,
  })

  // update package.json
  const packageJsonPath = path.resolve(rootDir, 'package.json')
  const existingPkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const updatedPkg = sortDependencies(deepMerge(existingPkg, pkg))
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPkg, null, 2) + '\n', 'utf8')

  // write to eslint.config.js, .prettierrc.json, .editorconfig, etc.
  for (const [fileName, content] of Object.entries(files)) {
    const fullPath = path.resolve(rootDir, fileName)
    fs.writeFileSync(fullPath, content as string, 'utf8')
  }
}




