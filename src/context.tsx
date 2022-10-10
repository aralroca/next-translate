import { createContext } from 'react'
import { I18n } from '.'

export default createContext<I18n>({
  t: (k) => (Array.isArray(k) ? k[0] : k),
  lang: '',
})
