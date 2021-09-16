/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {useEffect, useState} from 'react'
import {useVariant} from './use-variant'
import {useIntl} from 'react-intl'
import {useVariationParams} from './use-variation-params'
import {useVariationAttributes} from './use-variation-attributes'

const OUT_OF_STOCK = 'OUT_OF_STOCK'
const UNFULFILLABLE = 'UNFULFILLABLE'

// TODO: This needs to be refactored.
export const useProduct = (product) => {
    const intl = useIntl()

    // take the product quantity as initial value or set it to 1 by default
    const [quantity, setQuantity] = useState(product?.quantity || product?.minOrderQuantity || 1)
    const stockLevel = product?.inventory?.stockLevel || 0
    const variant = useVariant(product)
    const variationParams = useVariationParams(product)
    const variationAttributes = useVariationAttributes(product)
    const showLoading = !product
    const stepQuantity = product?.stepQuantity || 1
    const minOrderQuantity = product?.minOrderQuantity || 1

    // A product is considered out of stock if the stock level is 0 or if we have all our
    // variation attributes selected, but don't have a variant. We do this because the API
    // will sometimes return all the variants even if they are out of stock, but for other
    // products it won't.
    const isOutOfStock =
        !stockLevel ||
        (!variant && Object.keys(variationParams).length === variationAttributes.length)
    const unfulfillable = stockLevel < quantity

    const inventoryMessages = {
        [OUT_OF_STOCK]: intl.formatMessage({
            defaultMessage: 'Out of stock'
        }),
        [UNFULFILLABLE]: intl.formatMessage(
            {
                defaultMessage: 'Only {stockLevel} Left!'
            },
            {stockLevel}
        )
    }
    const showInventoryMessage = isOutOfStock || unfulfillable
    const inventoryMessage =
        (isOutOfStock && inventoryMessages[OUT_OF_STOCK]) ||
        (unfulfillable && inventoryMessages[UNFULFILLABLE])

    // Reset the quantity state if the master product changes.
    useEffect(() => {
        setQuantity(product?.quantity || product?.minOrderQuantity || 1)
    }, [product?.master?.masterId])

    return {
        showLoading,
        showInventoryMessage,
        inventoryMessage,
        variationAttributes,
        quantity,
        minOrderQuantity,
        stepQuantity,
        variationParams,
        setQuantity,
        variant,
        stockLevel
    }
}
