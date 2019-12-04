module.exports = {
  webpack(conf){
    conf.resolve = {
      ...conf.resolve || {},
      alias: {
        ...(conf.resolve.alias || {}),
        'i18n-next-static': path.resolve(__dirname, '../../lib'),
      },
      aliasFields: ['browser'],
    }
  }
}
