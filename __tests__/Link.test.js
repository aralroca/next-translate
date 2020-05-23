import { render } from '@testing-library/react'
import React from 'react'
import I18nProvider from '../src/I18nProvider'
import Link from '../src/Link'
import { setInternals } from '../src/_helpers/_internals'

function cleanup() {
  setInternals({
    defaultLangRedirect: undefined,
    defaultLanguage: undefined,
    isStaticMode: undefined,
  })
}

function CustomServerModeLink(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        defaultLangRedirect: 'lang-path',
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

function StaticModeLinkRedirectLangPath(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        isStaticMode: true,
        defaultLangRedirect: 'lang-path',
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

function StaticModeLinkRedirectRoot(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        isStaticMode: true,
        defaultLangRedirect: 'root',
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

function StaticModeLinkNoRedirect(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        isStaticMode: true,
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

StaticModeLinkRedirectLangPath.displayName = 'StaticModeLinkRedirectLangPath'
CustomServerModeLink.displayName = 'CustomServerMode'
StaticModeLinkRedirectRoot.displayName = 'StaticModeLinkRedirectRoot'
StaticModeLinkNoRedirect.displayName = 'StaticModeLinkNoRedirect'

const modes = [
  CustomServerModeLink,
  StaticModeLinkRedirectLangPath,
  StaticModeLinkRedirectRoot,
  StaticModeLinkNoRedirect,
]

describe('Link', () => {
  afterEach(cleanup)

  modes.forEach((LinkComponent) => {
    describe(`${LinkComponent.displayName}`, () => {
      test('Should add the current language navigating to homepage', () => {
        const expected = {
          StaticModeLinkRedirectLangPath: '<a href="/en">home</a>',
          CustomServerMode: '<a href="/en">home</a>',
          StaticModeLinkRedirectRoot: '<a href="/">home</a>',
          StaticModeLinkNoRedirect: '<a href="/">home</a>',
        }[LinkComponent.displayName]
        const { container } = render(
          <LinkComponent href="/">
            <a>home</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe(expected)
      })
      test('Should add the current language navigating to homepage with "as"', () => {
        const expected = {
          StaticModeLinkRedirectLangPath: '<a href="/en/homepage">home</a>',
          CustomServerMode: '<a href="/en/homepage">home</a>',
          StaticModeLinkRedirectRoot: '<a href="/homepage">home</a>',
          StaticModeLinkNoRedirect: '<a href="/homepage">home</a>',
        }[LinkComponent.displayName]
        const { container } = render(
          <LinkComponent href="/" as="/homepage">
            <a>home</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe(expected)
      })
      test('Should add the current language using nested route ', () => {
        const expected = {
          StaticModeLinkRedirectLangPath: '<a href="/en/some/route">link</a>',
          CustomServerMode: '<a href="/en/some/route">link</a>',
          StaticModeLinkRedirectRoot: '<a href="/some/route">link</a>',
          StaticModeLinkNoRedirect: '<a href="/some/route">link</a>',
        }[LinkComponent.displayName]
        const { container } = render(
          <LinkComponent href="/some/route">
            <a>link</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe(expected)
      })
      test('Should add the defined language navigating to homepage', () => {
        const { container } = render(
          <LinkComponent href="/" lang="es">
            <a>home</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/es">home</a>')
      })
      test('Should add the defined language using nested route ', () => {
        const { container } = render(
          <LinkComponent href="/some/route" lang="es">
            <a>link</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/es/some/route">link</a>')
      })
      test('Should not add the current language to the route', () => {
        const { container } = render(
          <LinkComponent noLang href="/some/route" lang="es">
            <a>link</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/some/route">link</a>')
      })
    })
  })
})
