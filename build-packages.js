const path = require('path')
const fs = require('fs')

const supportedExt = new Set(['js', 'ts', 'tsx'])

function createPackageFromFile(file, prefix, subfolder) {
  const [name, ext] = file.split('.')

  if (!supportedExt.has(ext)) return

  fs.mkdirSync(`${subfolder}${name}`)

  const packageJSON = JSON.stringify(
    {
      name: name.toLowerCase(),
      private: true,
      main: `${prefix}lib/cjs/${subfolder}${name}.js`,
      module: `${prefix}lib/esm/${subfolder}${name}.js`,
      types: `${prefix}${subfolder}${name}.d.ts`,
    },
    undefined,
    2
  )

  fs.writeFileSync(`${subfolder}${name}/package.json`, packageJSON)

  // It seems that VSCode and IDEs using auto-import are referenced by where the
  // types are. So moving the types to the root fix the auto-imports.
  fs.renameSync(
    `./types/${subfolder}${name}.d.ts`,
    `./${subfolder}${name}.d.ts`
  )
}

function createPackagesFromFolder(folder, prefix, subfolder = '') {
  const files = fs.readdirSync(folder)

  files.forEach((file) => {
    createPackageFromFile(file, prefix, subfolder)
  })
}

createPackagesFromFolder(path.join(__dirname, 'src'), '../')
fs.mkdirSync('plugin')
createPackageFromFile('loader.tsx', '../../', 'plugin/')
