import Document, { Html, Head, Main, NextScript } from 'next/document'
import documentLang from 'next-translate/documentLang'

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang={documentLang(this.props)}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
