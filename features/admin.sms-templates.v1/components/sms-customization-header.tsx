/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { Theme, styled } from "@mui/material/styles";
import Autocomplete, {
    AutocompleteRenderGroupParams,
    AutocompleteRenderInputParams
} from "@oxygen-ui/react/Autocomplete";
import Box from "@oxygen-ui/react/Box";
import Divider from "@oxygen-ui/react/Divider";
import TextField from "@oxygen-ui/react/TextField";
import Typography from "@oxygen-ui/react/Typography";
import { AppState } from "@wso2is/admin.core.v1/store";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { CommonUtils } from "@wso2is/core/utils";
import { DropdownChild, Field, Form } from "@wso2is/forms";
import { SupportedLanguagesMeta } from "@wso2is/i18n";
import { Hint } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, SyntheticEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Grid, Header, Segment } from "semantic-ui-react";
import { SMSTemplateType } from "../models/sms-templates";
import "./sms-customization-header.scss";

const FORM_ID: string = "sms-customization-header-form";

const LocaleGroupHeader: typeof Box = styled(Box)(({ theme }: { theme: Theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.25),
    padding: theme.spacing(1, 2, 0.5, 2)
}));

const LocaleGroupDivider: typeof Divider = styled(Divider)(({ theme }: { theme: Theme }) => ({
    borderBottomWidth: 2,
    marginBlock: theme.spacing(1),
    marginInline: theme.spacing(2)
}));

const LocaleGroupSubHeading: typeof Box = styled(Box)(({ theme }: { theme: Theme }) => ({
    alignItems: "center",
    display: "flex",
    gap: theme.spacing(0.5)
}));

interface SMSCustomizationHeaderProps extends IdentifiableComponentInterface {
    /**
     * Selected SMS template id.
     */
    selectedSMSTemplateId: string;

    /**
     * Selected SMS template description.
     */
    selectedSMSTemplateDescription: string;

    /**
     * Selected locale
     */
    selectedLocale: string;

    /**
     * SMS templates list.
     */
    smsTemplatesList: SMSTemplateType[];

    /**
     * Callback to be called when the template is changed.
     * @param templateId - selected template id from the dropdown
     */
    onTemplateSelected: (templateId: string) => void;

    /**
     * Callback to be called when the locale is change
     * @param locale - selected locale for template
     */
    onLocaleChanged: (localeOption: LocaleOption | null) => void;
}

export type LocaleOption = DropdownChild & {
    name: string;
    isDefaultLocale?: boolean;
};

type LocaleOptionList = LocaleOption[];

/**
 * SMS customization header.
 *
 * @param props - Props injected to the component.
 *
 * @returns Header component for SMS Customization.
 */
const SMSCustomizationHeader: FunctionComponent<SMSCustomizationHeaderProps> = ({
    selectedSMSTemplateId,
    selectedSMSTemplateDescription,
    selectedLocale,
    smsTemplatesList,
    onTemplateSelected,
    onLocaleChanged,
    ["data-componentid"]: componentId = "sms-customization-header"
}: SMSCustomizationHeaderProps): ReactElement => {

    const { t } = useTranslation();

    const [ localeList, setLocaleList ] =
        useState<LocaleOptionList>([]);

    const supportedI18nLanguagesFromStore: SupportedLanguagesMeta = useSelector(
        (state: AppState) => state.global.supportedI18nLanguages
    );

    const allSupportedLocales: SupportedLanguagesMeta = CommonUtils.getLocaleList();

    const smsTemplateListOptions: { text: string, value: string }[] = useMemo(() => {
        return smsTemplatesList?.map((template: SMSTemplateType) => {
            return {
                text: template.displayName,
                value: template.id
            };
        });
    }, [ smsTemplatesList ]);

    useEffect(() => {
        if (!allSupportedLocales) {
            return;
        }

        const toLocaleOption: (locale: { code: string; name: string; flag: string }, isDefaultLocale: boolean) =>
            LocaleOption = (locale: { code: string; name: string; flag: string }, isDefaultLocale: boolean) => ({
                isDefaultLocale,
                key: locale.code,
                name: `${ locale.name }, ${ locale.code }`,
                text: (
                    <div>
                        <i className={ locale.flag + " flag" }></i>
                        { locale.name }, { locale.code }
                    </div>
                ),
                value: locale.code
            });

        const defaultLocaleCodes: Set<string> = new Set(
            Object.values(supportedI18nLanguagesFromStore ?? {}).map(
                (locale: { code: string }) => locale.code
            )
        );

        const defaultLocaleList: LocaleOption[] = Object.values(supportedI18nLanguagesFromStore ?? {})
            .map((locale: { code: string; name: string; flag: string }) => toLocaleOption(locale, true));

        const otherLocaleList: LocaleOption[] = Object.values(allSupportedLocales)
            .filter((locale: { code: string }) => !defaultLocaleCodes.has(locale.code))
            .map((locale: { code: string; name: string; flag: string }) => toLocaleOption(locale, false));

        setLocaleList([ ...defaultLocaleList, ...otherLocaleList ]);
    }, [ allSupportedLocales, supportedI18nLanguagesFromStore ]);

    return (
        <Segment
            className="mb-4 p-4 sms-customization-header"
            data-componentid={ componentId }
            padded={ "very" }
        >
            <Form
                id={ FORM_ID }
                uncontrolledForm={ true }
                onSubmit={ () => { return; } }
            >
                <Grid>
                    <Grid.Column
                        mobile={ 16 }
                        computer={ 8 }
                    >
                        <Field.Dropdown
                            ariaLabel="SMS Template Dropdown"
                            name="selectedSMSTemplate"
                            label={ t("smsTemplates:form.inputs.template.label") }
                            options={ smsTemplateListOptions }
                            required={ true }
                            data-componentid={ `${ componentId }-sms-template-list` }
                            hint={ selectedSMSTemplateDescription ?? null }
                            placeholder={ t("smsTemplates:form.inputs.template.placeholder") }
                            value={ selectedSMSTemplateId }
                            listen={ onTemplateSelected }
                        />
                    </Grid.Column>

                    <Grid.Column
                        mobile={ 16 }
                        computer={ 8 }
                    >
                        <Autocomplete
                            disablePortal
                            fullWidth
                            aria-label="SMS Template Locale Dropdown"
                            className="pt-1"
                            ListboxProps={ {
                                sx: { maxHeight: "60vh" }
                            } }
                            componentsProps={ {
                                paper: {
                                    elevation: 2
                                },
                                popper: {
                                    modifiers: [
                                        {
                                            enabled: false,
                                            name: "flip"
                                        },
                                        {
                                            enabled: false,
                                            name: "preventOverflow"
                                        }
                                    ]
                                }
                            } }
                            data-componentid={ `${componentId}-api` }
                            isOptionEqualToValue={
                                (option: LocaleOption, value: LocaleOption) =>
                                    option.value === value.value
                            }
                            getOptionLabel={ (option: LocaleOption) => {
                                return option?.name;
                            } }
                            options={ localeList }
                            groupBy={ (option: LocaleOption) =>
                                option.isDefaultLocale ? "default" : "other"
                            }
                            renderGroup={ (params: AutocompleteRenderGroupParams) => (
                                <li key={ params.key }>
                                    { params.group === "other" && <LocaleGroupDivider /> }
                                    <LocaleGroupHeader>
                                        <Typography variant="subtitle2" fontWeight={ 600 } lineHeight={ 1.3 }>
                                            { params.group === "default"
                                                ? t("smsTemplates:form.inputs.locale.groups.default.heading")
                                                : t("smsTemplates:form.inputs.locale.groups.other.heading") }
                                        </Typography>
                                        <LocaleGroupSubHeading>
                                            <Typography variant="caption" color="text.secondary" lineHeight={ 1.3 }>
                                                { params.group === "default"
                                                    ? t("smsTemplates:form.inputs.locale.groups.default.subHeading")
                                                    : t("smsTemplates:form.inputs.locale.groups.other.subHeading") }
                                            </Typography>
                                            { params.group === "default" && (
                                                <Hint className="mt-0 mb-0" popup>
                                                    { t("smsTemplates:form.inputs.locale.groups.default.hint") }
                                                </Hint>
                                            ) }
                                        </LocaleGroupSubHeading>
                                    </LocaleGroupHeader>
                                    <ul className="p-0">{ params.children }</ul>
                                </li>
                            ) }
                            onChange={ (
                                _event: SyntheticEvent<HTMLElement>,
                                localeOption: LocaleOption | null
                            ) => {
                                onLocaleChanged(localeOption);
                            } }
                            noOptionsText={ t("common:noResultsFound") }
                            renderInput={ (params: AutocompleteRenderInputParams) => {

                                return (
                                    <TextField
                                        { ...params }
                                        label={ t("smsTemplates:form.inputs.locale.label") }
                                        required
                                        placeholder={ t("smsTemplates:form.inputs.locale.placeholder") }
                                        size="small"
                                        variant="outlined"
                                    />
                                );
                            } }
                            renderOption={ (props: React.ComponentProps<"li">, localeOption: LocaleOption) => {
                                return (
                                    <li { ...props }>
                                        <Header.Content>
                                            { localeOption.text }
                                        </Header.Content>
                                    </li>
                                );
                            } }
                            key="locale"
                            value={ localeList.find(
                                (locale: LocaleOption) => locale.value === selectedLocale
                            ) ?? null }
                        />
                    </Grid.Column>
                </Grid>
            </Form>
        </Segment>
    );
};

export default SMSCustomizationHeader;
