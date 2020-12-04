import { createContext } from 'react'
import { I18n } from '.'

export default createContext({
  t: (k: string) => (Array.isArray(k) ? k[0] : k),
  lang: '',
} as I18n)
