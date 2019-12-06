import { useContext } from 'react'
import I18nContext from './_context'

export default function useTranslation(){
  return useContext(I18nContext)
}
