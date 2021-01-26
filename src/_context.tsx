import { createContext } from 'react'
import { I18n } from '.'

export default createContext<I18n>({
  t: (k: string) => (Array.isArray(k) ? k[0] : k),
  lang: '',
})
