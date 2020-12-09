import getT from 'next-translate/getT'

// @ts-ignore
export default async function handler(req, res) {
  const t = await getT(req.query.__nextLocale, 'common')
  const title = t('title')

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ title }))
}
