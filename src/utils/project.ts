import * as path from 'path'
import {findWidgetRootDir} from './root_dir'
import Config from '../config'

export function getWidgetConfig() {
  const rootDir = findWidgetRootDir()
  return require(path.join(rootDir, Config.widgetConfigFileName))
}

export function getPackageJSON() {
  const rootDir = findWidgetRootDir()
  return require(path.join(rootDir, 'package.json'))
}

export function getName() {
  const packageJSON = getPackageJSON()
  return packageJSON.name
}

export function getVersion() {
  const packageJSON = getPackageJSON()
  return packageJSON.version
}
