import { cleanup, render } from '@testing-library/react'
import React from 'react'
import I18nProvider from '../src/I18nProvider'
import Link from '../src/Link'

function CustomServerModeLink(props) {
  return (
    <I18nProvider lang="en" namespaces={{}}>
      <Link {...props} />
    </I18nProvider>
  )
}

function StaticModeLinkWithRedirect(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        isStaticMode: true,
        redirectToDefaultLang: true,
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

function StaticModeLinkWithoutRedirect(props) {
  return (
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        isStaticMode: true,
        redirectToDefaultLang: false,
        defaultLanguage: 'en',
      }}
    >
      <Link {...props} />
    </I18nProvider>
  )
}

StaticModeLinkWithRedirect.displayName = 'StaticModeWithRedirect'
CustomServerModeLink.displayName = 'CustomServerMode'
StaticModeLinkWithoutRedirect.displayName = 'StaticModeWithoutRedirect'

const modes = [
  CustomServerModeLink,
  StaticModeLinkWithRedirect,
  StaticModeLinkWithoutRedirect,
]

describe('Link', () => {
  afterEach(cleanup)

  modes.forEach((LinkComponent) => {
    describe(`${LinkComponent.displayName}`, () => {
      test('Should add the current language navigating to homepage', () => {
        const expected = {
          StaticModeWithRedirect: '<a href="/en">home</a>',
          CustomServerMode: '<a href="/en">home</a>',
          StaticModeWithoutRedirect: '<a href="/">home</a>',
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
          StaticModeWithRedirect: '<a href="/en/homepage">home</a>',
          CustomServerMode: '<a href="/en/homepage">home</a>',
          StaticModeWithoutRedirect: '<a href="/homepage">home</a>',
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
          StaticModeWithRedirect: '<a href="/en/some/route">link</a>',
          CustomServerMode: '<a href="/en/some/route">link</a>',
          StaticModeWithoutRedirect: '<a href="/some/route">link</a>',
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
