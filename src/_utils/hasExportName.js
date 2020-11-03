export default function hasExportName(data, name) {
  return Boolean(
    data.match(getNormalExportRegex(name)) ||
      data.match(
        new RegExp(`export\\s*\\{[^}]*(?<!\\w)${name}(?!\\w)[^}]*\\}`, 'm')
      )
  )
}

export function getNormalExportRegex(name) {
  return new RegExp(`export +(const|var|let|async +function|function) +${name}`)
}
