import { I18n } from '.'
import React from 'react'

let context

// For serverComponents (app-dir), the context cannot be used and
// this makes that all the imports to here don't break the build.
// The use of this context is inside each util, depending pages-dir or app-dir.
if (typeof React.createContext === 'function') {
  context = React.createContext<I18n>({
    t: (k) => (Array.isArray(k) ? k[0] : k),
    lang: '',
  })
}

export default context as React.Context<I18n>
