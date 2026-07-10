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

import GroupedLocaleAutocomplete, { LocaleOption } from "@wso2is/admin.core.v1/components/grouped-locale-autocomplete";
import { IdentifiableComponentInterface } from "@wso2is/core/models";
import { Field, Form } from "@wso2is/forms";
import React, { FunctionComponent, ReactElement, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Grid, Segment } from "semantic-ui-react";
import { SMSTemplateType } from "../models/sms-templates";
import "./sms-customization-header.scss";

export type { LocaleOption };

const FORM_ID: string = "sms-customization-header-form";

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

    const smsTemplateListOptions: { text: string, value: string }[] = useMemo(() => {
        return smsTemplatesList?.map((template: SMSTemplateType) => {
            return {
                text: template.displayName,
                value: template.id
            };
        });
    }, [ smsTemplatesList ]);

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
                        <GroupedLocaleAutocomplete
                            ariaLabel="SMS Template Locale Dropdown"
                            selectedLocale={ selectedLocale }
                            onLocaleChanged={ onLocaleChanged }
                            data-componentid={ `${ componentId }-api` }
                        />
                    </Grid.Column>
                </Grid>
            </Form>
        </Segment>
    );
};

export default SMSCustomizationHeader;
