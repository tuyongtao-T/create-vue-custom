import * as path from 'node:path'

interface LanguageItem {
  hint?: string
  message: string
  invalidMessage?: string
  dirForPrompts?: {
    current: string
    target: string
  }
  toggleOptions?: {
    active: string
    inactive: string
  }
  selectOptions?: {
    [key: string]: { title: string; desc?: string }
  }
}

interface Language {
  projectName: LanguageItem
  shouldOverwrite: LanguageItem
  packageName: LanguageItem
  needsTypeScript: LanguageItem
  isH5: LanguageItem
  errors: {
    operationCancelled: string
  }
  defaultToggleOptions: {
    active: string
    inactive: string
  }
  infos: {
    scaffolding: string
    done: string
  }
}

export default function getLanguage() {
  const localesRoot = path.resolve(__dirname, 'locales')
  const languageFilePath = path.resolve(localesRoot, `zh-Hans.json`)
  const lang: Language = require(languageFilePath)
  return lang
}
