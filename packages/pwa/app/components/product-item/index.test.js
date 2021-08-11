/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
import React from 'react'
import ProductItem from './index'
import {mockedCustomerProductListsDetails} from '../../commerce-api/mock-data'
import {renderWithProviders} from '../../utils/test-utils'
import {screen} from '@testing-library/react'

// Set up and clean up
beforeEach(() => {
    jest.resetModules()

    // Need to mock TextEncoder for tests
    if (typeof TextEncoder === 'undefined') {
        global.TextEncoder = require('util').TextEncoder
    }
})

jest.setTimeout(60000)
const MockedComponent = () => {
    const product = mockedCustomerProductListsDetails.data[0]
    return <ProductItem product={{...product, productName: product.name}} />
}

test('renders product item name, attributes and price', () => {
    renderWithProviders(<MockedComponent />)

    expect(screen.getByText(/apple ipod nano/i)).toBeInTheDocument()
    expect(screen.getByText(/color: green/i)).toBeInTheDocument()
    expect(screen.getByText(/memory size: 16 GB/i)).toBeInTheDocument()
    expect(screen.getByText(/199/i)).toBeInTheDocument()
})