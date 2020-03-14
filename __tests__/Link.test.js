import React from 'react'
import { render, cleanup } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import Link from '../src/Link'

function StaticModeLink(props) {
  return (
    <I18nProvider lang="en" namespaces={{}} isStaticMode>
      <Link {...props} />
    </I18nProvider>
  )
}

function CustomServerModeLink(props) {
  return (
    <I18nProvider lang="en" namespaces={{}}>
      <Link {...props} />
    </I18nProvider>
  )
}

StaticModeLink.displayName = 'StaticMode'
CustomServerModeLink.displayName = 'CustomServerMode'

const modes = [StaticModeLink, CustomServerModeLink]

describe('Link', () => {
  afterEach(cleanup)

  modes.forEach(LinkComponent => {
    describe(`${LinkComponent.displayName}`, () => {
      test('Should add the current language navigating to homepage', () => {
        const { container } = render(
          <LinkComponent href="/">
            <a>home</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/en">home</a>')
      })
      test('Should add the current language navigating to homepage with "as"', () => {
        const { container } = render(
          <LinkComponent href="/" as="/homepage">
            <a>home</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/en/homepage">home</a>')
      })
      test('Should add the current language using nested route ', () => {
        const { container } = render(
          <LinkComponent href="/some/route">
            <a>link</a>
          </LinkComponent>
        )
        expect(container.innerHTML).toBe('<a href="/en/some/route">link</a>')
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
    })
  })
})
