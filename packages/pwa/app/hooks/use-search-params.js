/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * *
 * Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. *
 * * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {useLocation} from 'react-router-dom'
import qs from 'qs'

// Constants
import {DEFAULT_SEARCH_PARAMS} from '../constants'

/*
 * This hook will return all the location search params pertinant
 * to the product list page.
 */
export const useSearchParams = (searchParams = DEFAULT_SEARCH_PARAMS) => {
    const {search} = useLocation()
    const params = qs.parse(search.substring(1))

    params.refine = Array.isArray(params.refine) ? params.refine : [params.refine]

    return Object.keys(searchParams).reduce((acc, key) => {
        let value = params[`${key}`] || searchParams[key]

        if (!isNaN(value) && !Array.isArray(value)) {
            value = parseInt(value)
        }

        return {...acc, [key]: value}
    }, {})
}
