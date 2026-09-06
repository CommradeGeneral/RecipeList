import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = path.join(projectRoot, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const controlType = manifest.control?.identity?.type ?? ''
const guid = controlType.match(/^guid:\/\/([^/]+)$/i)?.[1]

if (!guid) {
  throw new Error('manifest.json does not contain a valid control identity GUID')
}

const controlPath = path.join(projectRoot, 'control')
const outputDirectory = 'E:\\tia v20\\Unified bullshit\\UserFiles\\CustomControls'
const archiveName = `{${guid}}.zip`
const outputPath = path.join(outputDirectory, archiveName)
const temporaryPath = path.join(projectRoot, `${archiveName}.tmp`)

if (!existsSync(controlPath)) {
  throw new Error('The control output directory does not exist. Run the Vite build first.')
}

rmSync(temporaryPath, { force: true })
rmSync(outputPath, { force: true })

const powershellScript = `
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path '${outputDirectory.replaceAll("'", "''")}' | Out-Null
Compress-Archive -Path '${manifestPath.replaceAll("'", "''")}', '${controlPath.replaceAll("'", "''")}' -DestinationPath '${temporaryPath.replaceAll("'", "''")}' -Force
Move-Item -Path '${temporaryPath.replaceAll("'", "''")}' -Destination '${outputPath.replaceAll("'", "''")}' -Force
`

execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', powershellScript], {
  cwd: projectRoot,
  stdio: 'inherit',
})

console.log(`Packaged ${archiveName} in ${outputDirectory}`)