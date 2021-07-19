import {Command} from '@oclif/command'
import * as glob from 'glob'
import * as path from 'path'
import * as fse from 'fs-extra'
import * as parser from 'gitignore-parser'
import * as archiver from 'archiver'
import * as crypto from 'crypto'
import * as chalk from 'chalk'
import {findWidgetRootDir} from '../utils/root_dir'
import {getName, getVersion} from '../utils/project'
import {readableFileSize} from '../utils/file'

export default class Release extends Command {
  static description = 'Release your widget'

  static examples = [
    `$ widget-cli release
Succeed!
`,
  ]

  getShaSum(file: string): Promise<string> {
    return new Promise(resolve => {
      const shaSum = crypto.createHash('sha1')
      const rs = fse.createReadStream(file)
      rs.on('data', function (data) {
        shaSum.update(data)
      })

      // making digest
      rs.on('end', function () {
        const hex = shaSum.digest('hex')
        resolve(hex)
      })
    })
  }

  pack(rootDir: string, outputName: string, files: string[]): Promise<archiver.Archiver> {
    return new Promise((resolve, reject) => {
      const output = fse.createWriteStream(path.join(rootDir, outputName))
      const archive = archiver('zip', {
        zlib: {level: 5}, // Sets the compression level.
      })

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        resolve(archive)
      })

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', () => {
        this.log('Data has been drained')
        resolve(archive)
      })

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          // log warning
          this.warn(err)
        } else {
          // throw error
          reject(err)
        }
      })

      // good practice to catch this error explicitly
      archive.on('error', function (err) {
        reject(err)
      })

      archive.pipe(output)

      files.forEach(file => {
        archive.append(fse.createReadStream(file), {name: path.relative(rootDir, file)})
      })

      archive.finalize()
    })
  }

  async getProjectFiles(rootDir: string): Promise<string[]> {
    const gitignorePath = path.resolve(rootDir, '.gitignore')
    const ignoreFile = fse.readFileSync(gitignorePath, 'utf8')
    const ignore = parser.compile(ignoreFile)

    return new Promise((resolve, reject) => {
      glob('**/*', {
        cwd: rootDir,
        nodir: true,
        ignore: ['node_modules/**'],
      }, (err, files) => {
        if (err) {
          reject(err)
          return
        }

        files = files.filter(ignore.accepts)
        resolve(files)
      })
    })
  }

  async run() {
    const rootDir = findWidgetRootDir()
    const files = await this.getProjectFiles(rootDir)

    const outputName = `${getName()}@${getVersion()}`
    const outputFile = `${outputName}.zip`

    await this.pack(rootDir, outputFile, files)
    const packageSize = fse.statSync(path.join(rootDir, outputFile)).size
    const shaSum = await this.getShaSum(path.join(rootDir, outputFile))

    // provide graceful log
    this.log(chalk.greenBright(`📦  ${outputName}`))
    this.log()
    this.log(chalk.yellowBright('=== Tarball Contents ==='))
    let unpackedSize = 0
    files.forEach(file => {
      const {size} = fse.statSync(file)
      this.log(`${readableFileSize(size).padEnd(8)} ${path.relative(rootDir, file)}`)
      unpackedSize += size
    })
    this.log()
    this.log(chalk.yellowBright('=== Tarball Details ==='))
    this.log(`name:          ${getName()}`)
    this.log(`version:       ${getVersion()}`)
    this.log(`filename:      ${outputFile}`)
    this.log(`package size:  ${readableFileSize(packageSize)}`)
    this.log(`unpacked size: ${readableFileSize(unpackedSize)}`)
    this.log(`shasum:        ${shaSum}`)
    this.log(`total files:   ${files.length}`)
  }
}
