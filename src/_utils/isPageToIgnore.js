const specFileOrFolderRgx = /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

function isPageToIgnore(page) {
  return (
    page.startsWith('/api/') ||
    page.startsWith('/_document.') ||
    specFileOrFolderRgx.test(page)
  )
}

export default isPageToIgnore
