import React from 'react'
import { render, cleanup, fireEvent } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import Router from '../src/Router'
import NextRouter from 'next/router'

jest.mock('next/router', () => ({
  push: jest.fn(),
}))

function Navigate({ href, as, lang }) {
  function nav() {
    Router.pushI18n(href, as, { lang })
  }

  return <button onClick={nav}>Navigate</button>
}

function StaticModeRouter(props) {
  return (
    <I18nProvider lang="en" namespaces={{}} isStaticMode>
      <Navigate {...props} />
    </I18nProvider>
  )
}

function CustomServerModeRouter(props) {
  return (
    <I18nProvider lang="en" namespaces={{}}>
      <Navigate {...props} />
    </I18nProvider>
  )
}

StaticModeRouter.displayName = 'StaticMode'
CustomServerModeRouter.displayName = 'CustomServerMode'

const modes = [StaticModeRouter, CustomServerModeRouter]

function expectNavigation({ href, as }) {
  expect(
    NextRouter.push.mock.calls[NextRouter.push.mock.calls.length - 1][0]
  ).toBe(href)
  expect(
    NextRouter.push.mock.calls[NextRouter.push.mock.calls.length - 1][1]
  ).toBe(as)
}

describe('Router', () => {
  afterEach(cleanup)

  modes.forEach(RouterComponent => {
    const isStatic = RouterComponent.displayName === 'StaticMode'

    describe(`${RouterComponent.displayName}`, () => {
      test('Should add the current language navigating to homepage', () => {
        const expected = isStatic
          ? { href: '/en', as: undefined }
          : { href: '/', as: '/en' }

        const { container } = render(<RouterComponent href="/" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language navigating to homepage with "as"', () => {
        const expected = isStatic
          ? { href: '/en', as: '/en/homepage' }
          : { href: '/', as: '/en/homepage' }

        const { container } = render(
          <RouterComponent href="/" as="/homepage" />
        )
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language using nested route ', () => {
        const expected = isStatic
          ? { href: '/en/some/route', as: undefined }
          : { href: '/some/route', as: '/en/some/route' }

        const { container } = render(<RouterComponent href="/some/route" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language navigating to homepage', () => {
        const expected = isStatic
          ? { href: '/es', as: undefined }
          : { href: '/', as: '/es' }

        const { container } = render(<RouterComponent href="/" lang="es" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language using nested route ', () => {
        const expected = isStatic
          ? { href: '/es/some/route', as: undefined }
          : { href: '/some/route', as: '/es/some/route' }

        const { container } = render(
          <RouterComponent href="/some/route" lang="es" />
        )
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
    })
  })
})
