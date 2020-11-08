const path = require('path');
const fs = require('fs');

const supportedExt = new Set(['js', 'ts', 'tsx'])
const src = path.join(__dirname, 'src');
const plugin = path.join(__dirname, 'src/plugin');

function createPackages(folder, prefix, subfolder = '') {
  const files = fs.readdirSync(folder)

  files.forEach(file => {
    const [name, ext] = file.split('.')

    if (!supportedExt.has(ext)) return

    fs.mkdirSync(`${subfolder}${name}`)

    const packageJSON = JSON.stringify({
      internal: true,
      main: `${prefix}lib/cjs/${subfolder}${name}.js`,
      module: `${prefix}lib/esm/${subfolder}${name}.js`,
      types: `${prefix}lib/esm/${subfolder}${name}.d.ts`,
    }, undefined, 2)

    fs.writeFileSync(`${subfolder}${name}/package.json`, packageJSON)
  })
}

createPackages(src, '../')
fs.mkdirSync('plugin')
createPackages(plugin, '../../', 'plugin/')
