function loader(code) {
  if (!this.resourcePath.startsWith(process.cwd() + '/pages/')) return code

  console.log(this.resourcePath)
  console.log(code)

  return code
}

module.exports = loader
