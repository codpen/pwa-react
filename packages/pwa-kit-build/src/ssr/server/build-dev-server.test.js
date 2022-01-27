/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {NO_CACHE} from 'pwa-kit-runtime/ssr/server/constants'
import {X_MOBIFY_REQUEST_CLASS} from 'pwa-kit-runtime/utils/ssr-proxying'
import fetch from 'node-fetch'
import request from 'supertest'
import {makeErrorHandler, DevServerFactory} from './build-dev-server'
import path from 'path'
import http from 'http'
import https from 'https'

const TEST_PORT = 3444
const testFixtures = path.resolve(__dirname, 'test_fixtures')

// Mocks methods on the DevServerFactory to skip setting
// up Webpack's dev middleware – a massive simplification
// for testing.
const NoWebpackDevServerFactory = {
    ...DevServerFactory,
    ...{
        addSSRRenderer() {},
        addSDKInternalHandlers() {},
        getRequestProcessor() {}
    }
}

const httpAgent = new http.Agent({})

/**
 * An HTTPS.Agent that allows self-signed certificates
 * @type {module:https.Agent}
 */
export const httpsAgent = new https.Agent({
    rejectUnauthorized: false
})

/**
 * Fetch and ignore self-signed certificate errors.
 */
const insecureFetch = (url, opts) => {
    return fetch(url, {
        ...opts,
        agent: (_parsedURL) => (_parsedURL.protocol === 'https:' ? httpsAgent : httpAgent)
    })
}

const opts = (overrides = {}) => {
    const defaults = {
        buildDir: path.join(testFixtures, 'build'),
        mobify: {
            ssrEnabled: true,
            ssrOnly: ['main.js.map', 'ssr.js', 'ssr.js.map'],
            ssrShared: ['main.js', 'ssr-loader.js', 'worker.js'],
            ssrParameters: {
                proxyConfigs: [
                    {
                        protocol: 'https',
                        host: 'test.proxy.com',
                        path: 'base'
                    },
                    {
                        protocol: 'https',
                        // This is intentionally an unreachable host
                        host: '0.0.0.0',
                        path: 'base2'
                    },
                    {
                        protocol: 'https',
                        host: 'test.proxy.com',
                        path: 'base3',
                        caching: true
                    }
                ]
            }
        },
        quiet: true,
        port: TEST_PORT,
        protocol: 'http',
        enableLegacyRemoteProxying: false,
        sslFilePath: path.join(testFixtures, 'localhost.pem')
    }
    return {
        ...defaults,
        ...overrides
    }
}

describe('Error handlers returned from makeErrorHandler', () => {
    const testServerErrorHandler = (error, times) => {
        const exit = jest.fn()
        const proc = {exit}
        const close = jest.fn()
        const devserver = {close}
        const log = jest.fn()
        const handler = makeErrorHandler(proc, devserver, log)
        const e = {code: error}

        handler(e)
        expect(close).toHaveBeenCalledTimes(times)
    }

    test('should exit the current process if the requested port is in use', () => {
        testServerErrorHandler('EADDRINUSE', 1)
    })

    test('should ignore errors other than EADDRINUSE', () => {
        testServerErrorHandler('EACCES', 0)
    })
})

describe('DevServer', () => {
    test('createApp creates an express app', () => {
        const app = NoWebpackDevServerFactory.createApp(opts())
        expect(app.options.defaultCacheControl).toEqual(NO_CACHE)
    })

    test(`createApp validates missing or invalid field "protocol"`, () => {
        expect(() => NoWebpackDevServerFactory.createApp(opts({protocol: 'ssl'}))).toThrow()
    })
})

describe('Request processor support', () => {
    const helloWorld = '<div>hello world</div>'

    let route

    beforeEach(() => {
        route = jest.fn().mockImplementation((req, res) => {
            res.send(helloWorld)
        })
    })

    afterEach(() => {
        route = undefined
    })

    test('SSRServer supports the request-processor and request class', () => {
        const ServerFactory = {
            ...NoWebpackDevServerFactory,
            ...{
                getRequestProcessor() {
                    return {
                        processRequest: ({getRequestClass, setRequestClass}) => {
                            console.log(`getRequestClass returns ${getRequestClass()}`)
                            setRequestClass('bot')
                            return {
                                path: '/altered',
                                querystring: 'foo=bar'
                            }
                        }
                    }
                }
            }
        }

        const app = ServerFactory.createApp(opts())
        app.get('/*', route)

        return request(app)
            .get('/')
            .expect(200)
            .then((response) => {
                const requestClass = response.headers[X_MOBIFY_REQUEST_CLASS]
                expect(requestClass).toEqual('bot')
                expect(route).toHaveBeenCalled()
            })
    })

    test('SSRServer handles no request processor', () => {
        const ServerFactory = {
            ...NoWebpackDevServerFactory,
            ...{
                getRequestProcessor() {
                    return null
                }
            }
        }

        const options = opts()
        const app = ServerFactory.createApp(options)
        app.get('/*', route)

        return request(app)
            .get('/')
            .expect(200)
            .then((response) => {
                expect(response.headers[X_MOBIFY_REQUEST_CLASS]).toBe(undefined)
                expect(route).toHaveBeenCalled()
                expect(response.text).toEqual(helloWorld)
            })
    })

    test('SSRServer handles a broken request processor', () => {
        // This is a broken because processRequest is required to return
        // {path, querystring}, but returns undefined

        const ServerFactory = {
            ...NoWebpackDevServerFactory,
            ...{
                getRequestProcessor() {
                    return {
                        processRequest: () => {
                            return
                        }
                    }
                }
            }
        }

        const app = ServerFactory.createApp(opts())
        app.get('/*', route)

        return request(app)
            .get('/')
            .expect(500)
            .then(() => {
                expect(route).not.toHaveBeenCalled()
            })
    })
})

describe('DevServer startup', () => {
    let server
    let originalEnv

    beforeEach(() => {
        originalEnv = Object.assign({}, process.env)
    })

    afterEach(() => {
        if (server) {
            server.close()
        }
        process.env = originalEnv
    })

    const cases = [
        {options: {protocol: 'http'}, env: {}, name: 'listens on http (set in options)'},
        {options: {protocol: 'https'}, env: {}, name: 'listens on https (set in options)'},
        {options: {}, env: {DEV_SERVER_PROTOCOL: 'http'}, name: 'listens on http (set in env var)'},
        {
            options: {},
            env: {DEV_SERVER_PROTOCOL: 'https'},
            name: 'listens on https (set in env var)'
        }
    ]

    cases.forEach(({options, env, name}) => {
        const protocol = options.protocol || env.DEV_SERVER_PROTOCOL
        test(name, () => {
            process.env = {...process.env, ...env}
            const {server: _server} = NoWebpackDevServerFactory.createHandler(
                opts(options),
                (app) => {
                    app.get('/*', (req, res) => {
                        res.send('<div>hello world</div>')
                    })
                }
            )
            server = _server
            return insecureFetch(`${protocol}://localhost:${TEST_PORT}`).then((response) => {
                expect(response.ok).toBe(true)
                return Promise.resolve()
            })
        })
    })
})
