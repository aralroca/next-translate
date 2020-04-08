export default (url, params) => {
  Object.keys(params).forEach((k) => {
    url = url.replace(`[${k}]`, params[k])
  })
  return url
}
