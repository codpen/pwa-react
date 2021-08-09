/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2021 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

import {mount} from 'enzyme'
import React from 'react'
import {DangerousHTML, getClosestAnchor} from './index.jsx'

const createElement = (html) => {
    const div = window.document.createElement('div')
    div.innerHTML = html.trim()
    return div.firstChild
}

beforeAll(() => {
    window.Capture = {
        enable: jest.fn((html) => html.replace(/x-src/g, 'src'))
    }
})

afterAll(() => {
    delete window.Capture
})

test('DangerousHTML renders without errors', () => {
    const wrapper = mount(
        <DangerousHTML html="test">
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )

    expect(wrapper.length).toBe(1)
})

test("DangerousHTML doesn't update if the html doesn't change", () => {
    const wrapper = mount(
        <DangerousHTML html="test">
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )
    expect(wrapper.instance().shouldComponentUpdate({html: 'test'}, {processHTML: false})).toBe(
        false
    )
})

test('DangerousHTML updates if the html does change', () => {
    const wrapper = mount(
        <DangerousHTML html="test">
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )
    expect(wrapper.instance().shouldComponentUpdate({html: 'not a test'})).toBe(true)
})

test("DangerousHTML doesn't update if the html changes but 'processHTML' is false", () => {
    const wrapper = mount(
        <DangerousHTML html="test">
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )
    expect(
        wrapper.instance().shouldComponentUpdate({html: 'not a test'}, {processHTML: false})
    ).toBe(true)
})

test('DangerousHTML updates external resources if flag is enabled', () => {
    const wrapper = mount(
        <DangerousHTML html="<img x-src='1.jpg' />" enableExternalResources={true}>
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )

    expect(wrapper.html()).toContain('<div><img src="1.jpg"></div>')
})

test("DangerousHTML doesn't update external resources if flag is disabled", () => {
    const wrapper = mount(
        <DangerousHTML html="<img x-src='1.jpg' />" enableExternalResources={false}>
            {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
        </DangerousHTML>
    )
    expect(wrapper.html()).toContain('<img x-src="1.jpg">')
})

describe('handles clicking on child links', () => {
    test('DangerousHTML uses browserHistory if the link is a react route', () => {
        const push = jest.fn()
        const wrapper = mount(
            <DangerousHTML html="">
                {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
            </DangerousHTML>
        )

        // Emulate `withRouter` by setting the history property manually.
        wrapper.setProps({history: {push}})

        // wrapper.find('a') doesn't work because of dangerouslySetInnerHTML
        // which means we can't simulate a click on the link itself
        // as a result, we need to simulate a link click instead
        const eventMock = {
            target: {
                tagName: 'A',
                href: '/test'
            }
        }

        expect(push).not.toHaveBeenCalled()
        wrapper.simulate('click', eventMock)
        expect(push).toHaveBeenCalledWith(eventMock.target.href)
    })

    test('DangerousHTML does not use browserHistory if the link is not a react route', () => {
        const push = jest.fn()
        const wrapper = mount(
            <DangerousHTML html="">
                {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
            </DangerousHTML>
        )

        // Emulate `withRouter` by setting the history property manually.
        wrapper.setProps({history: {push}})

        const eventMock = {
            target: {
                tagName: 'A',
                href: 'https://www.example.com/test'
            }
        }

        wrapper.simulate('click', eventMock)
        expect(push).not.toHaveBeenCalled()
    })

    test('DangerousHTML does not use browserHistory if its enableBrowserHistoryForLinks prop is false', () => {
        const push = jest.fn()
        const wrapper = mount(
            <DangerousHTML html="" enableBrowserHistoryForLinks={false}>
                {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
            </DangerousHTML>
        )

        // Emulate `withRouter` by setting the history property manually.
        wrapper.setProps({history: {push}})

        const eventMock = {
            target: {
                tagName: 'A',
                href: '/test'
            }
        }

        wrapper.simulate('click', eventMock)
        expect(push).not.toHaveBeenCalled()
    })

    test('does NOT browserHistory.push when an anchor is targetting a non-self browsing context', () => {
        const push = jest.fn()
        const wrapper = mount(
            <DangerousHTML html="" enableBrowserHistoryForLinks>
                {(htmlObj) => <div dangerouslySetInnerHTML={htmlObj} />}
            </DangerousHTML>
        )

        // Emulate `withRouter` by setting the history property manually.
        wrapper.setProps({history: {push}})

        const eventMock = {
            target: {
                tagName: 'A',
                href: '/test',
                target: '_blank' // Without this, `browserHistory.push` would trigger
            }
        }

        wrapper.simulate('click', eventMock)
        expect(push).not.toHaveBeenCalled()
    })
})

test("getClosestAnchor returns the given element if it's already an anchor", () => {
    const anchor = createElement('<a href=""></a>')
    expect(getClosestAnchor(anchor).tagName).toEqual('A')
})

test('getClosestAnchor returns the closest anchor when given an inner element that is non-anchor', () => {
    const image = createElement('<a href=""><div><img /></div></a>')
    expect(getClosestAnchor(image).tagName).toEqual('A')
})

test('getClosestAnchor returns null when given there is no closest anchor', () => {
    const div = createElement('<div />')
    expect(getClosestAnchor(div)).toEqual(null)
})

test('getClosestAnchor does not return any links outside of the container', () => {
    const el = createElement('<a href=""><div id="container"><img /></div></a>')
    const image = el.getElementsByTagName('img')[0]
    const container = el.getElementsByTagName('div')[0]
    expect(getClosestAnchor(image, container)).toEqual(null)
})
