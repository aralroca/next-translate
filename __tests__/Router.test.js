import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import I18nProvider from '../src/I18nProvider'
import NextRouter from 'next/router'
import Router from '../src/Router'
import { setInternals } from '../src/_helpers/_internals'

function cleanup() {
  setInternals({
    defaultLangRedirect: undefined,
    defaultLanguage: undefined,
    isStaticMode: undefined,
  })
}

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
    <I18nProvider
      lang="en"
      namespaces={{}}
      internals={{
        defaultLangRedirect: 'lang-path',
        defaultLanguage: 'en',
      }}
    >
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
        defaultLangRedirect: 'lang-path',
        defaultLanguage: 'en',
        isStaticMode: true,
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
        defaultLanguage: 'en',
        isStaticMode: true,
      }}
    >
      <Navigate {...props} />
    </I18nProvider>
  )
}

StaticModeRouter.displayName = 'StaticModeRedirect'
CustomServerModeRouter.displayName = 'CustomServerMode'
StaticModeRouterNoRedirect.displayName = 'StaticModeNoRedirect'

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
          StaticModeRedirect: { href: '/en', as: undefined },
          CustomServerMode: { href: '/', as: '/en' },
          StaticModeNoRedirect: { href: '/', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language navigating to homepage with "as"', () => {
        const expected = {
          StaticModeRedirect: { href: '/en', as: '/en/homepage' },
          CustomServerMode: { href: '/', as: '/en/homepage' },
          StaticModeNoRedirect: { href: '/', as: '/homepage' },
        }[RouterComponent.displayName]

        const { container } = render(
          <RouterComponent href="/" as="/homepage" />
        )
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the current language using nested route ', () => {
        const expected = {
          StaticModeRedirect: { href: '/en/some/route', as: undefined },
          CustomServerMode: { href: '/some/route', as: '/en/some/route' },
          StaticModeNoRedirect: { href: '/some/route', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/some/route" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language navigating to homepage', () => {
        const expected = {
          StaticModeRedirect: { href: '/es', as: undefined },
          CustomServerMode: { href: '/', as: '/es' },
          StaticModeNoRedirect: { href: '/es', as: undefined },
        }[RouterComponent.displayName]

        const { container } = render(<RouterComponent href="/" lang="es" />)
        fireEvent.click(container.firstChild)
        expectNavigation(expected)
      })
      test('Should add the defined language using nested route ', () => {
        const expected = {
          StaticModeRedirect: { href: '/es/some/route', as: undefined },
          CustomServerMode: { href: '/some/route', as: '/es/some/route' },
          StaticModeNoRedirect: { href: '/es/some/route', as: undefined },
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

  test('should work without specifying a language | to default language (with redirect to root)', () => {
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
            defaultLangRedirect: 'root',
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

  test('should work without specifying a language | to default language (with redirect to lang-path)', () => {
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
            defaultLangRedirect: 'lang-path',
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
