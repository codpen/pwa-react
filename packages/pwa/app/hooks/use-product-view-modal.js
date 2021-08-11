/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {useEffect, useState} from 'react'
import {rebuildPathWithParams, removeQueryParamsFromPath} from '../utils/url'
import {useHistory, useLocation} from 'react-router-dom'
import {isError, useCommerceAPI} from '../commerce-api/utils'
import {useVariant} from './use-variant'
import {useToast} from './use-toast'
import {useIntl} from 'react-intl'
import {API_ERROR_MESSAGE} from '../pages/account/constant'

/**
 * This hooks is responsible for fetching a product detail based on the variation selection
 * and managing the variation params on the url when the modal is open/close
 * @param initialProduct - the initial product when the modal is first open
 * @returns object
 */
export const useProductViewModal = (initialProduct) => {
    const location = useLocation()
    const api = useCommerceAPI()
    const history = useHistory()
    const intl = useIntl()
    const [product, setProduct] = useState(initialProduct)
    const [isFetching, setIsFetching] = useState(false)
    const toast = useToast()
    const variant = useVariant(product)

    const cleanUpVariantParams = () => {
        const paramToRemove = [...product.variationAttributes.map(({id}) => id), 'pid']
        const updatedUrl = removeQueryParamsFromPath(
            `${location.pathname}${location.search}`,
            paramToRemove
        )
        history.replace(updatedUrl)
    }

    useEffect(() => {
        // when the modal is first mounted,
        // clean up the params in case there are variant params not related to current product
        cleanUpVariantParams()
        return () => {
            // clean up the product and variant parameter from the url when the modal is unmouted
            cleanUpVariantParams()
        }
    }, [])

    useEffect(() => {
        // getting product detail based on variant selection for stockLevel
        const getProductDetailByVariant = async () => {
            // Fetch the product detail when the user select different variant
            if (variant && variant.productId !== product?.id) {
                setIsFetching(true)
                const res = await api.shopperProducts.getProduct({
                    parameters: {
                        id: variant.productId,
                        allImages: true
                    }
                })
                if (isError(res)) {
                    setIsFetching(false)
                    toast({
                        title: intl.formatMessage(
                            {defaultMessage: '{errorMessage}'},
                            {errorMessage: API_ERROR_MESSAGE}
                        ),
                        status: 'error'
                    })
                    throw new Error(res)
                }
                setProduct(res)
                setIsFetching(false)
            }
        }
        if (variant) {
            const {variationValues} = variant
            // update the url with the new product id and variation values when the variant changes
            const updatedUrl = rebuildPathWithParams(`${location.pathname}${location.search}`, {
                ...variationValues,
                pid: variant.productId
            })
            history.replace(updatedUrl)
        }
        getProductDetailByVariant()
    }, [variant])

    return {
        product,
        variant,
        isFetching
    }
}