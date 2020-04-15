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

function CustomServerModeRouter(props) {
  return (
    <I18nProvider lang="en" namespaces={{}}>
      <Navigate {...props} />
    </I18nProvider>
  )
}

function StaticModeRouter(props) {
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
      <Navigate {...props} />
    </I18nProvider>
  )
}

function StaticModeRouterNoRedirect(props) {
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
      <Navigate {...props} />
    </I18nProvider>
  )
}

StaticModeRouter.displayName = 'StaticModeWithRedirect'
CustomServerModeRouter.displayName = 'CustomServerMode'
StaticModeRouterNoRedirect.displayName = 'StaticModeWithoutRedirect'

const modes = [
  CustomServerModeRouter,
  StaticModeRouter,
  StaticModeRouterNoRedirect,
]

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

  modes.forEach((RouterComponent) => {
    describe(`${RouterComponent.displayName}`, () => {
      test('Should add the current language navigating to homepage', () => {
        const expected = {
          StaticModeWithRedirect: { href: '/en', as: undefined },
          CustomServerMode: { href: '/', as: '/en' },
          StaticModeWithoutRedirect: { href: '/', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language navigating to homepage with "as"', () => {
        const expected = {
          StaticModeWithRedirect: { href: '/en', as: '/en/homepage' },
          CustomServerMode: { href: '/', as: '/en/homepage' },
          StaticModeWithoutRedirect: { href: '/', as: '/homepage' },
        }[RouterComponent.displayName]

        const { container } = render(
          <RouterComponent href="/" as="/homepage" />
        )
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language using nested route ', () => {
        const expected = {
          StaticModeWithRedirect: { href: '/en/some/route', as: undefined },
          CustomServerMode: { href: '/some/route', as: '/en/some/route' },
          StaticModeWithoutRedirect: { href: '/some/route', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/some/route" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language navigating to homepage', () => {
        const expected = {
          StaticModeWithRedirect: { href: '/es', as: undefined },
          CustomServerMode: { href: '/', as: '/es' },
          StaticModeWithoutRedirect: { href: '/es', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/" lang="es" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language using nested route ', () => {
        const expected = {
          StaticModeWithRedirect: { href: '/es/some/route', as: undefined },
          CustomServerMode: { href: '/some/route', as: '/es/some/route' },
          StaticModeWithoutRedirect: { href: '/es/some/route', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(
          <RouterComponent href="/some/route" lang="es" />
        )
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
    })
  })

  test('should work without specifying a language | to another language', () => {
    function nav() {
      Router.pushI18n('/some/route')
    }
    function Component() {
      return (
        <I18nProvider
          lang="es"
          namespaces={{}}
          internals={{ isStaticMode: true }}
        >
          <button onClick={nav}>Navigate</button>
        </I18nProvider>
      )
    }
    const { container } = render(<Component />)
    fireEvent.click(container.firstChild)
    expectNavigation({ href: '/es/some/route', as: undefined })
  })

  test('should work without specifying a language | to default language (no redirect)', () => {
    function nav() {
      Router.pushI18n('/some/route')
    }
    function Component() {
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
          <button onClick={nav}>Navigate</button>
        </I18nProvider>
      )
    }
    const { container } = render(<Component />)
    fireEvent.click(container.firstChild)
    expectNavigation({ href: '/some/route', as: undefined })
  })

  test('should work without specifying a language | to default language (with redirect)', () => {
    function nav() {
      Router.pushI18n('/some/route')
    }
    function Component() {
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
          <button onClick={nav}>Navigate</button>
        </I18nProvider>
      )
    }
    const { container } = render(<Component />)
    fireEvent.click(container.firstChild)
    expectNavigation({ href: '/en/some/route', as: undefined })
  })
})
