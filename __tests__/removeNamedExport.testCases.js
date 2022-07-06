export default [
  {
    code: `
    export function other() {}

    export function namedExport() {}

    export function last() {}
  `,
  },
  {
    code: `
    export const other = true

    export const namedExport = other

    export const last = false
    `,
  },
  {
    code: `
    export const other = true

    export const before = other, namedExport = before

    export const last = false
    `,
  },
  {
    code: `
    export const other = true

    export const namedExport = other, after = namedExport

    export const last = false
    `,
  },
  {
    code: `
    export const other = true

    export const before = other, namedExport = before, after = namedExport

    export const last = false
    `,
  },
  {
    code: `
    function other() {}
    export { other }

    function namedExport() {}
    export { namedExport }

    function last() {}
    export { last }
  `,
  },
  {
    code: `
    function other() {}
    export { other }

    function localNamedExport() {}
    export { localNamedExport as namedExport }

    function last() {}
    export { last }
  `,
    localName: 'localNamedExport',
  },
  {
    code: `
    function exportBefore() {}
    function namedExport() {}
    function exportAfter() {}

    export { exportBefore, namedExport, exportAfter }

    function last() {}
    export { last }
  `,
  },
].map((testCase) => ({
  ...testCase,
  name: testCase.code
    .split('\n')
    .find((line) => line.includes('export') && line.includes('namedExport'))
    .trim(),
}))
