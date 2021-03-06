/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import {
    handleCompileTheme,
    handleCSS,
    handleProductName,
    handleSetAppName,
    handleSetCopyrightText,
    handleSetLogo,
    handleStyles,
    handleThemeToggle
} from "./actions";
import React, { createContext, Dispatch, useReducer } from "react";
import { ThemeCompileOptionsInterface, ThemeContextInterface, ThemeTypes } from "./models";
import { themeContextReducer, themeInitialState } from "./reducer";

/**
 * ThemeContext.
 */
export const ThemeContext = createContext<ThemeContextInterface>({
    compile: () => { return; },
    dispatch: (() => 0) as Dispatch<any>,
    setAppName: () => { return; },
    setCSS: () => { return; },
    setCopyrightText: () => { return; },
    setLogo: () => { return; },
    setProductName: () => { return; },
    setStyles: () => { return; },
    setTheme: () => { return; },
    state: themeInitialState
});

/**
 * ThemeContext Provider.
 *
 * @param {any} { children } - Wrap content/elements.
 * @returns { RecatElement } - ThemeContext Provider.
 */
export const ThemeProvider = ({ children }) => {
    const [ state, dispatch ] = useReducer(themeContextReducer, themeInitialState);

    const compile = (options?: ThemeCompileOptionsInterface) => { handleCompileTheme(dispatch, state, options); };

    const setAppName = (name: string) => { handleSetAppName(dispatch, name); };
    const setCSS = (css: string) => { handleCSS(dispatch, css); };
    const setCopyrightText = (text: string) => { handleSetCopyrightText(dispatch, text); };
    const setLogo = (url: string) => { handleSetLogo(dispatch, url); };
    const setProductName = (name: string) => { handleProductName(dispatch, name); };
    const setStyles = (styles: ThemeCompileOptionsInterface) => { handleStyles(dispatch, styles); };
    const setTheme = (theme: ThemeTypes) => { handleThemeToggle(dispatch, theme); };

    /**
     * Render state, dispatch and special case actions.
     */
    return (
        <ThemeContext.Provider value={ {
            compile,
            dispatch,
            setAppName,
            setCSS,
            setCopyrightText,
            setLogo,
            setProductName,
            setStyles,
            setTheme,
            state
        } }>
            { children }
        </ThemeContext.Provider>
    );
};
