function loader(a) {
  return this.resourcePath.startsWith(process.cwd() + '/pages/')
    ? (console.log(this.resourcePath), console.log(a), a)
    : a
}
module.exports = loader
