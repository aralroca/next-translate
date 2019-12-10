import React from 'react'

function Layout(props) {
  return (
    <>
      {props.children}
      <style jsx global>{`
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 18px;
          font-weight: 400;
          line-height: 1.8;
          background-color: #fafafa;
          color: #212121;
          font-family: sans-serif;
        }
        h1 {
          font-weight: 700;
        }
        p {
          margin-bottom: 10px;
        }
      `}</style>
    </>
  )
}

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}