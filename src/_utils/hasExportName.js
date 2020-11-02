export default function hasExportName(data, name) {
  return Boolean(
    data.match(
      new RegExp(`export (const|var|let|async function|function) ${name}`)
    ) ||
      data.match(
        new RegExp(`export\\s*\\{[^}]*(?<!\\w)${name}(?!\\w)[^}]*\\}`, 'm')
      )
  )
}
