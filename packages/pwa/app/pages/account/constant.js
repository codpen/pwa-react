/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {defineMessages} from 'react-intl'
import {AccountIcon, LocationIcon, PaymentIcon, ReceiptIcon} from '../../components/icons'

export const messages = defineMessages({
    profile: {defaultMessage: 'Account Details'},
    addresses: {defaultMessage: 'Addresses'},
    orders: {defaultMessage: 'Order History'},
    payments: {defaultMessage: 'Payment Methods'}
})

export const navLinks = [
    {
        name: 'profile',
        path: '',
        icon: AccountIcon
    },
    {
        name: 'orders',
        path: '/orders',
        icon: ReceiptIcon
    },
    {
        name: 'addresses',
        path: '/addresses',
        icon: LocationIcon
    },
    {
        name: 'payments',
        path: '/payments',
        icon: PaymentIcon
    }
]
