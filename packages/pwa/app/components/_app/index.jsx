/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import {useHistory, useLocation} from 'react-router-dom'

import {pages, PAGEEVENTS} from 'pwa-kit-react-sdk/dist/ssr/universal/events'
import {PAGEVIEW, ERROR, OFFLINE} from 'pwa-kit-react-sdk/dist/analytics-integrations/types'
import {getAssetUrl} from 'pwa-kit-react-sdk/dist/ssr/universal/utils'

// Chakra
import {
    Box,

    // Hooks
    useDisclosure,
    useStyleConfig
} from '@chakra-ui/react'
import {SkipNavLink, SkipNavContent} from '@chakra-ui/skip-nav'

// Contexts
import {CategoriesContext} from '../../contexts'

// Local Project Components
import Header from '../../components/header'
import OfflineBanner from '../../components/offline-banner'
import OfflineBoundary from '../../components/offline-boundary'
import ScrollToTop from '../../components/scroll-to-top'
import Footer from '../../components/footer'
import CheckoutHeader from '../../pages/checkout/partials/checkout-header'
import CheckoutFooter from '../../pages/checkout/partials/checkout-footer'
import DrawerMenu from '../drawer-menu'
import ListMenu from '../list-menu'
import {HideOnDesktop, HideOnMobile} from '../responsive'

// Hooks
import useShopper from '../../commerce-api/hooks/useShopper'

// Others
import {watchOnlineStatus, flatten} from '../../utils/utils'
import {IntlProvider, getLocaleConfig} from '../../locale'
import {getAnalyticsManager} from '../../analytics'

import Seo from '../seo'

const analyticsManager = getAnalyticsManager()

const DEFAULT_NAV_DEPTH = 3
const DEFAULT_ROOT_CATEGORY = 'root'
const HOME_HREF = '/'

const App = (props) => {
    const {children, targetLocale, defaultLocale, messages, categories: allCategories = {}} = props

    const history = useHistory()
    const location = useLocation()

    const [isOnline, setIsOnline] = useState(true)
    const [categories, setCategories] = useState(allCategories)
    const styles = useStyleConfig('App')

    const {isOpen, onOpen, onClose} = useDisclosure()

    // Used to conditionally render header/footer for checkout page
    const isCheckout = /\/checkout$/.test(location?.pathname)

    // Set up customer and basket
    useShopper()

    useEffect(() => {
        // Listen for events from the SDK to send analytics for.
        pages.on(PAGEEVENTS.PAGELOAD, (evt) => {
            analyticsManager.track(PAGEVIEW, evt)
            analyticsManager.trackPageLoad(evt)
        })
        pages.on(PAGEEVENTS.ERROR, (evt) => {
            analyticsManager.track(ERROR, evt)
        })

        // Listen for online status changes to update state and send analytics for.
        watchOnlineStatus((isOnline) => {
            setIsOnline(isOnline)

            analyticsManager.track(OFFLINE, {
                startTime: !isOnline ? new Date().getTime() : null
            })
        })
    }, [])

    useEffect(() => {
        // Lets automatically close the mobile navigation when the
        // location path is changed.
        onClose()
    }, [location])

    const onLogoClick = () => {
        // Goto the home page.
        history.push(HOME_HREF)

        // Close the drawer.
        onClose()
    }

    const onCartClick = () => {
        // Goto the home page.
        history.push(`/${targetLocale}/cart`)

        // Close the drawer.
        onClose()
    }

    return (
        <Box className="sf-app" {...styles.container}>
            <IntlProvider locale={targetLocale} defaultLocale={defaultLocale} messages={messages}>
                <CategoriesContext.Provider value={{categories, setCategories}}>
                    <Seo>
                        <meta name="theme-color" content="#0288a7" />
                        <meta
                            name="apple-mobile-web-app-title"
                            content="PWA-Kit-Retail-React-App"
                        />
                        <link
                            rel="apple-touch-icon"
                            href={getAssetUrl('static/img/global/apple-touch-icon.png')}
                        />
                        <link rel="manifest" href={getAssetUrl('static/manifest.json')} />
                    </Seo>

                    <ScrollToTop />

                    <Box id="app" className="c-app">
                        <SkipNavLink zIndex="skipLink">Skip to Content</SkipNavLink>

                        {!isCheckout ? (
                            <Header
                                onMenuClick={onOpen}
                                onLogoClick={onLogoClick}
                                onMyCartClick={onCartClick}
                            >
                                <HideOnDesktop>
                                    <DrawerMenu
                                        isOpen={isOpen}
                                        onClose={onClose}
                                        onLogoClick={onLogoClick}
                                        root={categories[DEFAULT_ROOT_CATEGORY]}
                                    />
                                </HideOnDesktop>

                                <HideOnMobile>
                                    <ListMenu root={categories[DEFAULT_ROOT_CATEGORY]} />
                                </HideOnMobile>
                            </Header>
                        ) : (
                            <CheckoutHeader />
                        )}

                        {!isOnline && <OfflineBanner />}

                        <SkipNavContent>
                            <Box as="main" id="app-main" role="main" flex="1">
                                <Box className="c-app__content">
                                    <OfflineBoundary isOnline={isOnline}>
                                        {children}
                                    </OfflineBoundary>
                                </Box>
                            </Box>
                        </SkipNavContent>

                        {!isCheckout ? <Footer /> : <CheckoutFooter />}
                    </Box>
                </CategoriesContext.Provider>
            </IntlProvider>
        </Box>
    )
}

App.shouldGetProps = () => {
    // In this case, we only want to fetch data for the app once, on the server.
    return typeof window === 'undefined'
}

App.getProps = async ({api, params}) => {
    const localeConfig = await getLocaleConfig({
        getUserPreferredLocales: () => {
            // TODO: You can detect their preferred locales from:
            // - client side: window.navigator.languages
            // - the page URL they're on (example.com/en/home)
            // - cookie (if their previous preference is saved there)
            // And decide which one takes precedence.

            const localeInPageUrl = params.locale
            return localeInPageUrl ? [localeInPageUrl] : []

            // If in this function an empty array is returned (e.g. there isn't locale in the page url),
            // then the app would use the default locale as the fallback.
        }
    })

    // Login as `guest` to get session.
    await api.auth.login()

    // Get the root category, this will be used for things like the navigation.
    const rootCategory = await api.shopperProducts.getCategory({
        parameters: {id: DEFAULT_ROOT_CATEGORY, levels: DEFAULT_NAV_DEPTH}
    })

    // Flatten the root so we can easily access all the categories throughout
    // the application.
    const categories = flatten(rootCategory, 'categories')

    return {
        targetLocale: localeConfig.app.targetLocale,
        defaultLocale: localeConfig.app.defaultLocale,
        messages: localeConfig.messages,
        categories: categories
    }
}

App.propTypes = {
    children: PropTypes.node,
    targetLocale: PropTypes.string,
    defaultLocale: PropTypes.string,
    location: PropTypes.object,
    messages: PropTypes.object,
    categories: PropTypes.object
}

export default App
