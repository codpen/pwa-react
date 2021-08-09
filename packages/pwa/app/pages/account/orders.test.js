import React, {useEffect} from 'react'
import {Route, Switch} from 'react-router-dom'
import {screen} from '@testing-library/react'
import user from '@testing-library/user-event'
import {rest} from 'msw'
import {setupServer} from 'msw/node'
import {Crypto} from '@peculiar/webcrypto'
import {renderWithProviders} from '../../utils/test-utils'
import {
    mockedRegisteredCustomer,
    mockOrderHistory,
    mockOrderProducts
} from '../../commerce-api/mock-data'
import useCustomer from '../../commerce-api/hooks/useCustomer'
import Orders from './orders'

jest.mock('../../commerce-api/utils', () => {
    const originalModule = jest.requireActual('../../commerce-api/utils')
    return {
        ...originalModule,
        isTokenValid: jest.fn().mockReturnValue(true)
    }
})

const MockedComponent = () => {
    const customer = useCustomer()

    useEffect(() => {
        if (customer?.authType !== 'registered') {
            customer.login('est@test.com', 'password')
        }
    }, [])

    if (customer?.authType !== 'registered') {
        return null
    }

    return (
        <Switch>
            <Route path="/en/orders">
                <Orders />
            </Route>
        </Switch>
    )
}

const server = setupServer(
    rest.post('*/customers/actions/login', (req, res, ctx) =>
        res(
            ctx.delay(0),
            ctx.set('authorization', `Bearer guesttoken`),
            ctx.json(mockedRegisteredCustomer)
        )
    ),
    rest.get('*/customers/:customerId/orders', (req, res, ctx) =>
        res(ctx.delay(0), ctx.json(mockOrderHistory))
    ),
    rest.get('*/products', (req, res, ctx) => res(ctx.delay(0), ctx.json(mockOrderProducts))),
    rest.get('*/customers/:customerId', (req, res, ctx) =>
        res(ctx.delay(0), ctx.json(mockedRegisteredCustomer))
    ),
    rest.post('*/oauth2/authorize', (req, res, ctx) =>
        res(ctx.delay(0), ctx.status(303), ctx.set('location', `/testcallback`))
    ),
    rest.post('*/oauth2/login', (req, res, ctx) =>
        res(ctx.delay(0), ctx.status(200), ctx.json(mockedRegisteredCustomer))
    ),

    rest.get('*/oauth2/authorize', (req, res, ctx) =>
        res(ctx.delay(0), ctx.status(303), ctx.set('location', `/testcallback`))
    ),

    rest.get('*/testcallback', (req, res, ctx) => {
        return res(ctx.delay(0), ctx.status(200))
    }),

    rest.post('*/oauth2/token', (req, res, ctx) =>
        res(
            ctx.delay(0),
            ctx.json({
                customer_id: 'test',
                access_token: 'testtoken',
                refresh_token: 'testrefeshtoken',
                usid: 'testusid'
            })
        )
    )
)

// Set up and clean up
beforeEach(() => {
    jest.resetModules()
    server.listen({onUnhandledRequest: 'error'})

    // Need to mock TextEncoder for tests
    if (typeof TextEncoder === 'undefined') {
        global.TextEncoder = require('util').TextEncoder
    }

    // Need to mock window.crypto for tests
    window.crypto = new Crypto()
    window.history.pushState({}, 'Account', '/en/orders')
})
afterEach(() => {
    localStorage.clear()
    server.resetHandlers()
})
afterAll(() => server.close())

test('Renders order history and details', async () => {
    renderWithProviders(<MockedComponent />)
    expect(await screen.findByTestId('account-order-history-page')).toBeInTheDocument()
    expect(await screen.findAllByText('Ordered: Apr 6, 2021')).toHaveLength(3)
    expect(
        await screen.findAllByAltText(
            'Pleated Bib Long Sleeve Shirt, Silver Grey, small',
            {},
            {timeout: 15000}
        )
    ).toHaveLength(3)

    user.click((await screen.findAllByText(/view details/i))[0])
    expect(await screen.findByTestId('account-order-details-page')).toBeInTheDocument()
    expect(await screen.findByText(/order number: 00028011/i)).toBeInTheDocument()
    expect(
        await screen.findByAltText(/Pleated Bib Long Sleeve Shirt, Silver Grey, small/i)
    ).toBeInTheDocument()
    expect(
        await screen.findByAltText(/Long Sleeve Crew Neck, Fire Red, small/i)
    ).toBeInTheDocument()
})
