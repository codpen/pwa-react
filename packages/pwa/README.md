<img alt="logo" src="react-retail-app.png" />

# PWA Kit - Retail React App

The Retail React App is an isomorphic JavaScript storefront [Progressive Web App](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps) built using [React](https://reactjs.org/) and [Express](https://expressjs.com/). It uses a modern headless architecture that enables developers to decouple the frontend from backend systems. It leverages popular open-source libraries in the React ecosystem, such as [Chakra UI](https://chakra-ui.com/) components, [Emotion](https://emotion.sh/docs/introduction) (CSS-in-JS), [Webpack](https://webpack.js.org/), and many more.

Developers enjoy a streamlined experience without having to worry about the underlying infrastructure, whether they're developing their app locally, deploying it to a [Managed Runtime](https://developer.commercecloud.com/s/article/PWA-Kit) environment, or testing the app live.

## 📖 Table of Contents
  * [**Prerequisites**](#-prerequisites)
  * [**Getting Started**](#-getting-started)
  * [**Configurations**](#-configurations)
  * [**NPM Scripts**](#-npm-scripts)
  * [**Directory Structure**](#-directory-structure)
  * [**Commerce API Integration**](#commerce-api-integration)
  * [**Localization**](#localization)
  * [**Theming**](#-theming)
  * [**Testing**](#-testing)
  * [**Deploying**](#deploying)
  * [**SVG icons**](#svg-icons)
  * [**Useful External Links**](#useful-external-links)

## 🔌 Prerequisites

-   Node.js 10.x or 12.x (14.x support coming soon)

## 🚀 Getting Started

To start the Server Side Rendering (SSR) server, run:

```bash
npm install
npm start
# then open http://localhost:3000 in your browser
```

## 🛠 Configurations

The React Retail App is built with [Commerce API](https://developer.commercecloud.com/s/article/CommerceAPI-ConfigurationValues), [OCAPI](https://documentation.b2c.commercecloud.salesforce.com/DOC2/topic/com.demandware.dochelp/OCAPI/current/usage/OpenCommerceAPI.html), and [SLAS](https://developer.commercecloud.com/s/api-details/a003k00000VzoEyAAJ/commerce-cloud-developer-centershopperloginandapiaccessadmin) integrations. When generating a project, you will be prompted to configure these integrations. If you want to update these configuration values later, here's how to do it:

### Update Configurations

#### The package.json file

| name                                          | Description                                                                             |
| --------------------------------------------- | --------------------------------------------------------------------------------------- |
| `projectSlug`                                 | Matches your project ID in the [Runtime Admin](https://runtime.commercecloud.com/) tool |
| `mobify.ssrParameters.ssrFunctionNodeVersion` | Matches your project's Node version (`10.x`, `12.x`)                                    |
| `mobify.ssrParameters.proxyConfigs`           | Proxy configuration for Commerce API, OCAPI and SLAS                                    |

Sample Proxy Configs:

```json
{
    "proxyConfigs": [
        {
            "host": "12345678.api.commercecloud.salesforce.com",
            "path": "api"
        },
        {
            "host": "xxxx-000.sandbox.us01.dx.commercecloud.salesforce.com",
            "path": "ocapi"
        },
        {
            "host": "prd.us.shopper.commercecloud.salesforce.com",
            "path": "slas"
        }
    ]
}
```

#### The app/commerce-api.config.js file

Sample Commerce API config:

```js
export const commerceAPIConfig = {
    proxyPath: `/mobify/proxy/api`,
    parameters: {
        clientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Client ID from Account Manager
        organizationId: 'f_ecom_xxxx_xxx', // Organization ID from Business Manager
        shortCode: 'xxxxxxxx', // Short code from Business Manager
        siteId: 'RefArch' // Site ID from Business Manager
    }
}
```

## 📜 NPM Scripts

You can run `npm run <SCRIPT_NAME>` to run the following available scripts:

| name                      | Description                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `analyze-build`           | Build the project in production mode and create two [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) reports. These are used for performance optimization to ensure the bundle size is kept small. |
| `compile-messages`        | Compile all localized messages into AST format                                                                                                                                                                                                          |
| `extract-messages`        | Automatically extract the default locale's messages from the React components                                                                                                                                                                |
| `format`                  | Format the code using [Prettier](https://prettier.io/)                                                                                                                                                                               |
| `lint`                    | Find inconsistent code styling using [ESlint](https://eslint.org/)                                                                                                                                                                   |
| `lint:fix`                | Automatically fix ESlint errors                                                                                                                                                                                                      |
| `prod:build`              | Build the project in production mode                                                                                                                                                                                                |
| `push`                    | Push the bundle (production build code artifacts) to your [Runtime Admin](https://runtime.commercecloud.com/) project                                                                                                                |
| `save-credentials`        | Save Runtime Admin credentials locally (for `push` command)                                                                                                                                                                          |
| `start`                   | Start the SSR server                                                                                                                                                                                                                 |
| `start:inspect`           | Start the SSR server using Node.js inspector                                                                                                                                                                                         |
| `start:pseudolocale`      | Start the SSR server with pseudo locale                                                                                                                                                                                                                                  |
| `test`                    | Run unit tests using [Jest](https://jestjs.io/)                                                                                                                                                                                      |
| `test:e2e`                | Run end-to-end tests using [Cypress](https://www.cypress.io/)                                                                                                                                                                        |
| `test:e2e-ci`             | Run end-to-end tests in CI mode                                                                                                                                                                                                      |
| `test:lighthouse`         | Run [Lighthouse](https://developers.google.com/web/tools/lighthouse) test                                                                                                                                                            |
| `test:max-file-size`      | Run [bundlesize](https://github.com/siddharthkp/bundlesize) test                                                                                                                                                                     |

## 🔖 Directory Structure

```
app/                                    The actual application code lives in here
├── assets/svg/                         SVG icons
├── commerce-api/                       Commerce API client and hooks
├── components/                         React components
│   ├── _app                            Root component
│   ├── _app-config                     Inject context providers, state management, etc.
│   └── _error                          Generic error component
│   └── ...
├── contexts/                           React contexts
├── hooks/                              React hooks
├── pages/                              Pages like homepage, PLP, PDP, etc.
├── static/                             Static assets
│   └── manifest.json                   PWA manifest
│   └── ...
├── theme/                              Chakra UI theme
│   ├── components/
│   │   ├── base/                       Theme files for Chakra components
│   │   └── project/                    Theme files for custom components
│   ├── foundations/                    Chakra UI theme foundations like spacing, etc.
│   └── index.js
├── translations/                       Localization
├── analytics.js                        Analytics integrations, like Google Analytics.
├── commerce-api.config.js              Commerce api configuration
├── locale.js                           Localization
├── main.jsx                            Client side starting point
├── request-processor.js                Request processing at CDN edge
├── routes.jsx                          React app routes
└── ssr.js                              Server side rendering starting point
```

## Commerce API Integration

The project is built on top of the [commerce-sdk-isomorphic](https://github.com/SalesforceCommerceCloud/commerce-sdk-isomorphic) client, and provides a wrapper class called `CommerceAPI` in `app/commerce-api/index.js`.

The `CommerceAPI` class is automatically injected in the pages's `getProps` method. For example, you can access the API wrapper from your pages like:

```jsx
const MyPage = (props) => {
    const {categories} = props
    return <div>There are {categories.length} categories.</div>
}

MyPage.getProps = async ({api}) => {
    categories = await api.shopperProducts.getCategory({
        parameters: {id: categoryId, levels: 0}
    })

    return {categories}
}
```

The `CommerceAPI` wrapper currently uses OCAPI for baskets and orders and uses the Commerce API for customer, product, promotion, gift certificates, and search.

## Localization

See [Localization README.md](./app/translations/README.md)
## ✨ Theming

The React Retail App follows the [Chakra Theming](https://chakra-ui.com/) rules and the default theme is based on the [System UI Theme Specification](https://system-ui.com/theme/).

You can customize the feel and look of the project by updating the values in `app/theme` directory.

**Note**: Theming is available for most of the reusable components in `app/components` and is not available for the pages like Product Details Page or Product Listing Page, so you will need to update the inline styles in `app/pages` to change the styles of these pages.

## 🔍 Testing

Your project comes with two testing suites already integrated: `jest` and
`react-testing-library` for unit tests and `cypress.io` for end-to-end tests.

To run these tests, type the commands below in your terminal:

```bash
# Runs your unit tests
npm run test
```

```bash
# Runs your end-to-end tests. (Be sure to have your local dev server running in the
# background or another tab)
npm run test:e2e
```

We've also included sample tests for both unit and e2e tests in the sample pages created.

For more information on how you can test your app, look at the sample unit tests located
along side your page components, and end-to-end tests located in the `app/cypress` folder.

You can continue your learning by looking at each library's documentation below:

-   [cypress.io](https://docs.cypress.io/)
-   [jest](https://jestjs.io/docs/getting-started/)
-   [react-testing-library](https://testing-library.com/docs/react-testing-library/intro)

### Run Lighthouse tests in your PWA

This will run Lighthouse three times and upload the median Lighthouse report.

```bash
npm run test:lighthouse
```

## Deploying

To deploy your app on [Managed Runtime](https://developer.commercecloud.com/s/article/PWA-Kit) environments, first you will need to make sure that your [Runtime Admin](https://runtime.commercecloud.com/) credentials are saved on your computer by running `npm run save-credentials`. Read the [step-by-step guide](https://developer.commercecloud.com/s/article/Pushing-and-Deploying-Bundles) for more details.

Next, you can run `npm run push -- -m "{{your bundle message}}"` to push a bundle to [Runtime Admin](https://runtime.commercecloud.com/). Once a bundle is successfully pushed, you will be able to deploy the bundle to your environment using the [Runtime Admin](https://runtime.commercecloud.com/) tool or the [Managed Runtime API](https://developer.commercecloud.com/s/api-details/a003k00000VzwSvAAJ/commerce-cloud-developer-centermanagedruntime).

## SVG Icons

To include custom SVG icons in the project, add them to the `app/assets/svg` directory, import them in `app/components/icons/index.js`, and export the React icon component like this: `export const MyCustomIcon = icon('my-custom-icon')`.

The imported SVG icons are packaged into an SVG sprite at build time, and the sprite is included in the server side rendered HTML.

## Useful external links:

* [PWA Kit Documentation](https://developer.commercecloud.com/s/article/PWA-Kit)
* [Commerce API](https://developer.commercecloud.com/s/commerce-api)
* [Runtime Admin](https://runtime.commercecloud.com/)
* [Trailhead](https://trailhead.salesforce.com/en/content/learn/modules/commerce-pwa-kit-and-managed-runtime)
