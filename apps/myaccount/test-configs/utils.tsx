/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { RenderResult, render as rtlRender } from "@testing-library/react";
import React, { ComponentType, PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import ReduxStoreStateMock from "./__mocks__/redux-store-state-mock.json";
import { mockStore } from "./redux-store-mock";

/**
 * Custom render method to includes things like global context providers, data stores, etc.
 * @see {@link https://testing-library.com/docs/react-testing-library/setup#custom-render} for more info.
 *
 * @param {React.ReactElement} ui - Component to render.
 * @param {any} initialState - Redux store initial state.
 * @param {MockStoreEnhanced<any, Record<string, unknown>>} store - Mocked store.
 * @param {{}} renderOptions - Render options.
 *
 * @return {RenderResult}
 */
const render = (
    ui: ReactElement,
    {
        initialState = ReduxStoreStateMock,
        store = mockStore(initialState),
        ...renderOptions
    } = {}
): RenderResult => {

    const Wrapper = (props: PropsWithChildren<ComponentType>): ReactElement => {
        
        const { children } = props;

        return <Provider store={ store }>{ children }</Provider>;
    };

    return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// re-export everything
export * from "@testing-library/react";
// override render method
export { render };