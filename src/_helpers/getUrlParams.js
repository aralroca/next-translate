export default (template, url) => {
  url = url.split('/')
  template = template.split('/')
  let params = {}
  template.forEach((v, i) => {
    if (v.slice(0, 1) == '[') {
      let k = v.replace('[', '').replace(']', '')
      params[k] = url[i]
    }
  })
  return params
}
