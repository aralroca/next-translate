const specFileOrFolderRgx = /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

function isPageToIgnore(page) {
  return Boolean(
    page.startsWith('/api/') ||
      page.startsWith('/_document.') ||
      page.match(specFileOrFolderRgx)
  )
}

export default isPageToIgnore
