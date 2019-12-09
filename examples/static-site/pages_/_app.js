import React from 'react'

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <h1>STATIC SITE EXAMPLE</h1>
      <Component {...pageProps} />
    </>
  )
}