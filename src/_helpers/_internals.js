let i = {}

export const setInternals = (l) => {
  i.lang = l.lang
  ;(i.isStaticMode = l.isStaticMode), (i.alias = l.alias)
}

export default i
