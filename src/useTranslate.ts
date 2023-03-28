import useTranslation from './useTranslation'

export const useTranslate = <T extends readonly string[]>({
  nameSpace = 'common',
  keys,
}: {
  keys: readonly [...T]
  nameSpace?: string
}) => {
  const { t } = useTranslation(nameSpace)
  return keys.reduce((acc, key) => {
    acc[key] = t(key)
    return acc
  }, {} as Record<(typeof keys)[number], string>)
 
}
//useCase 
// const App =()=>{
//   const text = useTranslate({keys:['title','description']})
//   return <div>
//     <h1>{text.title}</h1>
//     <p>{text.description}</p>
//   </div>

// }