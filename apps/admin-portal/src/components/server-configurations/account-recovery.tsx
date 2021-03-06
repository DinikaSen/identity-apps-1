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

import { AlertInterface, AlertLevels, TestableComponentInterface } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { Field, Forms, useTrigger } from "@wso2is/forms";
import { EditSection, GenericIcon, Hint, LinkButton, Section } from "@wso2is/react-components";
import React, { FunctionComponent, ReactElement, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Accordion, Divider, Form, Grid, Icon } from "semantic-ui-react";
import { getAccountRecoveryConfigurations, updateAccountRecoveryConfigurations } from "../../api";
import { SettingsSectionIcons } from "../../configs";
import { ServerConfigurationsConstants } from "../../constants";
import { AccountRecoveryConfigurationsInterface } from "../../models";

/**
 * Prop types for the account recovery component.
 */
interface AccountRecoveryProps extends TestableComponentInterface {
    onAlertFired: (alert: AlertInterface) => void;
}

/**
 * User Account Recovery component.
 *
 * @param {AccountRecoveryProps} props - Props injected to the account recovery component.
 *
 * @return {React.ReactElement}
 */
export const AccountRecovery: FunctionComponent<AccountRecoveryProps> = (
    props: AccountRecoveryProps
): ReactElement => {

    const {
        [ "data-testid" ]: testId
    } = props;

    const [ accountRecoveryConfigs, setAccountRecoveryConfigs ] = useState<AccountRecoveryConfigurationsInterface>({});
    const [ mainAccordionActiveState, setMainAccordionActiveState ] = useState<boolean>(false);
    const [ subAccordionActiveIndex, setSubAccordionActiveIndex ] = useState<number>(undefined);
    const [ reset] = useTrigger();

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const handleUpdateError = (error) => {
        if (error.response && error.response.data && error.response.data.detail) {
            dispatch(addAlert({
                description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "updateConfigurations.error.description", { description: error.response.data.description }),
                level: AlertLevels.ERROR,
                message: t("adminPortal:components.serverConfigs.accountRecovery.notifications.updateConfigurations." +
                    "error.message")
            }));
        } else {
            // Generic error message
            dispatch(addAlert({
                description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "updateConfigurations.genericError.description"),
                level: AlertLevels.ERROR,
                message: t("adminPortal:components.serverConfigs.accountRecovery.notifications.updateConfigurations." +
                    "genericError.message")
            }));
        }
    };

    const handleRetrievalError = (error) => {
        if (error.response && error.response.data && error.response.data.detail) {
            dispatch(addAlert({
                description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "getConfigurations.error.description", { description: error.response.data.description }),
                level: AlertLevels.ERROR,
                message: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "getConfigurations.error.message")
            }));
        } else {
            // Generic error message
            dispatch(addAlert({
                description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "getConfigurations.genericError.description"),
                level: AlertLevels.ERROR,
                message: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                    "getConfigurations.genericError.message")
            }));
        }
    };
    
    /**
     * Calls the API and update the account recovery configurations.
     */
    const makeAccountRecoveryPatchCall = (data, successNotification) => {
        updateAccountRecoveryConfigurations(data)
            .then(() => {
                setAccountRecoveryConfigsFromAPI();
                setSubAccordionActiveIndex(undefined);
                dispatch(addAlert(successNotification));
            })
            .catch((error) => {
                handleUpdateError(error);
            });
    };

    const saveAccountRecoveryConfigs = (key, value) => {
        const data = {
            "operation": "UPDATE",
            "properties": [
                {
                    "name": key,
                    "value": value
                }
            ]
        };
        const successNotification = {
            description: "",
            level: AlertLevels.SUCCESS,
            message: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                "updateConfigurations.success.message")
        };
        switch (key) {
            case ServerConfigurationsConstants.USERNAME_RECOVERY_ENABLE:
                successNotification.description = t("adminPortal:components.serverConfigs.accountRecovery." +
                    "notifications.updateEnableUsernameRecovery.success.description");
                break;
            case ServerConfigurationsConstants.USERNAME_RECOVERY_RE_CAPTCHA:
                successNotification.description = t("adminPortal:components.serverConfigs.accountRecovery." +
                    "notifications.updateUsernameRecoveryReCaptcha.success.description");
                break;
            case ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE:
                successNotification.description = t("adminPortal:components.serverConfigs.accountRecovery." +
                    "notifications.updateEnableNotificationPasswordRecovery.success.description");
                break;
            case ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA:
                successNotification.description = t("adminPortal:components.serverConfigs.accountRecovery." +
                    "notifications.updateNotificationPasswordRecoveryReCaptcha.success.description");
                break;
            case ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_ENABLE:
                successNotification.description = t("adminPortal:components.serverConfigs.accountRecovery." +
                    "notifications.updateSecurityQuestionPasswordRecoveryReCaptcha.success.description");
                break;
        }
        makeAccountRecoveryPatchCall(data, successNotification);
    };

    const saveAccountRecoveryAdvancedConfigs = (configs) => {
        const data = {
            "operation": "UPDATE",
            "properties": [
                {
                    "name": ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_FORCED_ENABLE,
                    "value": configs.enableForcedChallengeQuestions.length > 0 ? "true" : "false"
                },
                {
                    "name": ServerConfigurationsConstants.RE_CAPTCHA_MAX_FAILED_ATTEMPTS,
                    "value": configs.reCaptchaMaxFailedAttempts
                },
                {
                    "name": ServerConfigurationsConstants.ACCOUNT_RECOVERY_NOTIFICATIONS_INTERNALLY_MANAGED,
                    "value": configs.notificationInternallyManaged.length > 0 ? "true" : "false"
                },
                {
                    "name": ServerConfigurationsConstants.NOTIFY_RECOVERY_START,
                    "value": configs.notificationCheckBoxes.includes(
                        ServerConfigurationsConstants.NOTIFY_RECOVERY_START) ? "true" : "false"
                },
                {
                    "name": ServerConfigurationsConstants.NOTIFY_SUCCESS,
                    "value": configs.notificationCheckBoxes.includes(
                        ServerConfigurationsConstants.NOTIFY_SUCCESS) ? "true" : "false"
                },
                {
                    "name": ServerConfigurationsConstants.RECOVERY_LINK_EXPIRY_TIME,
                    "value": configs.recoveryLinkExpiryTime
                },
                {
                    "name": ServerConfigurationsConstants.RECOVERY_SMS_EXPIRY_TIME,
                    "value": configs.smsOTPExpiryTime
                },
                {
                    "name": ServerConfigurationsConstants.RECOVERY_CALLBACK_REGEX,
                    "value": configs.callbackRegex
                }
            ]
        };
        const successNotification = {
            description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                "updateConfigurations.success.description"),
            level: AlertLevels.SUCCESS,
            message: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                "updateConfigurations.success.message")
        };
        makeAccountRecoveryPatchCall(data, successNotification);
    };

    /**
     * Loop through API response and extract check box values.
     *
     * @param data API response data.
     * @param checkBoxes Names of the checkboxes as an array.
     */
    const getCheckBoxes = (data, checkBoxes) => {
        const values = [];
        checkBoxes.map(checkBox => {
            data.properties.map((property => {
                if (property.name === checkBox) {
                    property.value === "true" ? values.push(checkBox) : "";
                }
            }))
        });
        return values;
    };

    const getNotificationCheckBoxes = (data) => {
        return getCheckBoxes(data, [
            ServerConfigurationsConstants.NOTIFY_SUCCESS,
            ServerConfigurationsConstants.NOTIFY_RECOVERY_START
        ]);
    };

    const getFormValues = (values) => {
        return {
            callbackRegex: values.get(ServerConfigurationsConstants.RECOVERY_CALLBACK_REGEX),
            enableForcedChallengeQuestions: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_FORCED_ENABLE),
            enableNotificationPasswordRecovery: accountRecoveryConfigs.enableNotificationPasswordRecovery,
            enableReCaptchaForNotificationPasswordRecovery: accountRecoveryConfigs.
                enableReCaptchaForNotificationPasswordRecovery,
            enableReCaptchaForQuestionPasswordRecovery: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE),
            enableReCaptchaForUsernameRecovery: accountRecoveryConfigs.enableReCaptchaForUsernameRecovery,
            enableSecurityQuestionPasswordRecovery: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_ENABLE),
            enableUsernameRecovery: accountRecoveryConfigs.enableUsernameRecovery,
            notificationCheckBoxes: values.get("NotificationCheckBoxes"),
            notificationInternallyManaged: values.get(
                ServerConfigurationsConstants.ACCOUNT_RECOVERY_NOTIFICATIONS_INTERNALLY_MANAGED
            ),
            passwordRecoveryMinAnswers: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_MIN_ANSWERS),
            reCaptchaMaxFailedAttempts: values.get(ServerConfigurationsConstants.RE_CAPTCHA_MAX_FAILED_ATTEMPTS),
            recoveryLinkExpiryTime: values.get(ServerConfigurationsConstants.RECOVERY_LINK_EXPIRY_TIME),
            smsOTPExpiryTime: values.get(ServerConfigurationsConstants.RECOVERY_SMS_EXPIRY_TIME)
        }
    };

    const setAccountRecoveryConfigsFromAPI = () => {
        getAccountRecoveryConfigurations()
            .then((response) => {
                const configs = {
                    callbackRegex: response.properties.find(
                        property => property.name == ServerConfigurationsConstants.RECOVERY_CALLBACK_REGEX).value,
                    enableForcedChallengeQuestions: extractArrayValue(response,
                        ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_FORCED_ENABLE),
                    enableNotificationPasswordRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE),
                    enableReCaptchaForNotificationPasswordRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA),
                    enableReCaptchaForQuestionPasswordRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE),
                    enableReCaptchaForUsernameRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.USERNAME_RECOVERY_RE_CAPTCHA),
                    enableSecurityQuestionPasswordRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_ENABLE),
                    enableUsernameRecovery: extractArrayValue(response,
                        ServerConfigurationsConstants.USERNAME_RECOVERY_ENABLE),
                    notificationCheckBoxes: getNotificationCheckBoxes(response),
                    notificationInternallyManaged: extractArrayValue(response,
                        ServerConfigurationsConstants.ACCOUNT_RECOVERY_NOTIFICATIONS_INTERNALLY_MANAGED),
                    passwordRecoveryMinAnswers: response.properties.find(
                        property => property.name ==
                            ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_MIN_ANSWERS).value,
                    reCaptchaMaxFailedAttempts: response.properties.find(
                        property => property.name ==
                            ServerConfigurationsConstants.RE_CAPTCHA_MAX_FAILED_ATTEMPTS).value,
                    recoveryLinkExpiryTime: response.properties.find(
                        property => property.name == ServerConfigurationsConstants.RECOVERY_LINK_EXPIRY_TIME).value,
                    smsOTPExpiryTime: response.properties.find(
                        property => property.name == ServerConfigurationsConstants.RECOVERY_SMS_EXPIRY_TIME).value
                };
                setAccountRecoveryConfigs(configs);
            })
            .catch((error) => {
                handleRetrievalError(error);
            });
    };

    /**
     * Load account recovery configurations from the API, on page load.
     */
    useEffect(() => {
        setAccountRecoveryConfigsFromAPI();
    }, []);

    const extractArrayValue = (response, key) => {
        return response.properties.find(prop => prop.name === key).value === "true" ? [key] : [];
    };

    const showReCaptchaForUsernameRecovery: ReactElement = (
        <Grid className="middle aligned mt-1">
            <Grid.Row columns={ 2 } className="inner-list-item mt-3 mb-3">
                <Grid.Column className="first-column" mobile={ 1 } tablet={ 1 } computer={ 1 }>
                </Grid.Column>
                <Grid.Column mobile={ 15 } tablet={ 15 } computer={ 15 }>
                    <Field
                        name={ ServerConfigurationsConstants.USERNAME_RECOVERY_RE_CAPTCHA }
                        required={ false }
                        requiredErrorMessage=""
                        type="checkbox"
                        children={ [
                            {
                                label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "usernameRecovery.form.enableReCaptcha.label"),
                                value: ServerConfigurationsConstants.USERNAME_RECOVERY_RE_CAPTCHA
                            }
                        ] }
                        value={ accountRecoveryConfigs.enableReCaptchaForUsernameRecovery }
                        listen={
                            (values) => {
                                const value = values.get(ServerConfigurationsConstants.
                                    USERNAME_RECOVERY_RE_CAPTCHA).length > 0 ? "true" : "false";
                                saveAccountRecoveryConfigs(ServerConfigurationsConstants.USERNAME_RECOVERY_RE_CAPTCHA,
                                    value);
                            }
                        }
                        data-testid={ `${ testId }-form-enable-recaptcha-checkbox` }
                    />
                    <Hint>
                        { t("adminPortal:components.serverConfigs.accountRecovery." +
                            "usernameRecovery.form.enableReCaptcha.hint") }
                    </Hint>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );

    const showReCaptchaForNotificationPasswordRecovery: ReactElement = (
        <Grid className="middle aligned mt-1">
            <Grid.Row columns={ 2 } className="inner-list-item mt-3 mb-3">
                <Grid.Column className="first-column" mobile={ 1 } tablet={ 1 } computer={ 1 }>
                </Grid.Column>
                <Grid.Column mobile={ 15 } tablet={ 15 } computer={ 15 }>
                    <Field
                        name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA }
                        required={ false }
                        requiredErrorMessage=""
                        type="checkbox"
                        children={ [
                            {
                                label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "passwordRecovery.form.enableReCaptchaForNotificationBasedRecovery.label"),
                                value: ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA
                            }
                        ] }
                        value={ accountRecoveryConfigs.enableReCaptchaForNotificationPasswordRecovery }
                        listen={
                            (values) => {
                                const value = values.get(ServerConfigurationsConstants.
                                    PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA).length > 0 ? "true" : "false";
                                saveAccountRecoveryConfigs(ServerConfigurationsConstants.
                                    PASSWORD_RECOVERY_NOTIFICATION_BASED_RE_CAPTCHA, value);
                            }
                        }
                        data-testid={ `${ testId }-form-enable-recaptcha-for-notification-based-recovery-checkbox` }
                    />
                    <Hint>
                        { t("adminPortal:components.serverConfigs.accountRecovery." +
                            "passwordRecovery.form.enableReCaptchaForNotificationBasedRecovery.hint") }
                    </Hint>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );

    const saveQuestionPasswordRecoverySettings = (values) => {
        const configs = {
            enableReCaptchaForQuestionPasswordRecovery: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE),
            passwordRecoveryMinAnswers: values.get(
                ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_MIN_ANSWERS)
        };
        const data = {
            "operation": "UPDATE",
            "properties": [
                {
                    "name": ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE,
                    "value": configs.enableReCaptchaForQuestionPasswordRecovery.length > 0 ? "true" :
                        "false"
                },
                {
                    "name": ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_MIN_ANSWERS,
                    "value": configs.passwordRecoveryMinAnswers
                }
            ]
        };
        const successNotification = {
            description: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                "updateConfigurations.success.description"),
            level: AlertLevels.SUCCESS,
            message: t("adminPortal:components.serverConfigs.accountRecovery.notifications." +
                "updateConfigurations.success.message")
        };
        makeAccountRecoveryPatchCall(data, successNotification);
    };

    const showQuestionPasswordRecoverySettings: ReactElement = (
        <Grid className="middle aligned mt-1">
            <Grid.Row columns={ 2 } className="inner-list-item mt-3 mb-3">
                <Grid.Column className="first-column" mobile={ 1 } tablet={ 1 } computer={ 1 }>
                </Grid.Column>
                <Grid.Column mobile={ 15 } tablet={ 15 } computer={ 15 }>
                    <Field
                        name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE }
                        required={ false }
                        requiredErrorMessage=""
                        type="checkbox"
                        children={ [
                            {
                                label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "passwordRecovery.form." +
                                    "enableReCaptchaForSecurityQuestionBasedRecovery.label"),
                                value: ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_RE_CAPTCHA_ENABLE
                            }
                        ] }
                        value={ accountRecoveryConfigs.enableReCaptchaForQuestionPasswordRecovery }
                        data-testid={
                            `${ testId }-form-enable-recaptcha-for-security-question-based-recovery-checkbox`
                        }
                    />
                    <Hint>
                        { t("adminPortal:components.serverConfigs.accountRecovery.passwordRecovery." +
                            "form.enableReCaptchaForSecurityQuestionBasedRecovery.hint") }
                    </Hint>
                    <Divider className="hidden"/>
                    <Field
                        label={ t("adminPortal:components.serverConfigs.accountRecovery." +
                            "passwordRecovery.form.noOfQuestionsRequired.label") }
                        name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_MIN_ANSWERS }
                        placeholder={ t("adminPortal:components.serverConfigs.accountRecovery." +
                            "passwordRecovery.form.noOfQuestionsRequired.placeholder") }
                        required={ true }
                        requiredErrorMessage={ t("adminPortal:components.serverConfigs." +
                            "accountRecovery.passwordRecovery.form.noOfQuestionsRequired." +
                            "validations.empty") }
                        type="number"
                        value={ accountRecoveryConfigs.passwordRecoveryMinAnswers }
                        width={ 9 }
                        data-testid={ `${ testId }-form-no-of-questions-required-input` }
                    />
                    <Hint>
                        { t("adminPortal:components.serverConfigs.accountRecovery.passwordRecovery." +
                            "form.noOfQuestionsRequired.hint") }
                    </Hint>
                    <Form.Group>
                        <Field
                            name=""
                            required={ false }
                            requiredErrorMessage=""
                            size="small"
                            type="submit"
                            value={ t("common:update").toString() }
                            data-testid={ `${ testId }-form-submit-button` }
                        />
                    </Form.Group>
                </Grid.Column>
            </Grid.Row>
        </Grid>
    );

    const handleSubAccordionClick = (index) => {
        if (subAccordionActiveIndex === index) {
            setSubAccordionActiveIndex(undefined)
        } else {
            setSubAccordionActiveIndex(index)
        }
    };

    const usernameRecoveryAccordion: ReactElement = (
        <Accordion data-testid={ `${ testId }-username-recovery-accordion` }>
            <Accordion.Title
                active={ subAccordionActiveIndex === 1 }
                index={ 0 }
                onClick={ () => {
                    handleSubAccordionClick(1)
                } }
                className={ (accountRecoveryConfigs?.enableUsernameRecovery?.length > 0) ? "" : "disabled" }
            >
                <Grid className="middle aligned mt-1">
                    <Grid.Row columns={ 2 } className="inner-list-item">
                        <Grid.Column className="first-column">
                            <Icon
                                className="modal-icon"
                                name={ accountRecoveryConfigs?.enableReCaptchaForUsernameRecovery?.length > 0 ?
                                    "check circle" : "circle outline" }
                                size="large"
                                color={ (accountRecoveryConfigs.enableUsernameRecovery?.length > 0 &&
                                    accountRecoveryConfigs?.enableReCaptchaForUsernameRecovery?.length > 0) ? "orange" :
                                    "grey" }
                            />
                            { t("adminPortal:components.serverConfigs.accountRecovery." +
                                "usernameRecovery.form.enableReCaptcha.label") }
                        </Grid.Column>
                        <Grid.Column className="last-column pr-6" textAlign="right">
                            <GenericIcon
                                size="default"
                                defaultIcon
                                link
                                inline
                                transparent
                                verticalAlign="middle"
                                className="pr-3"
                                icon={ <Icon name="angle right" className="chevron"/> }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Accordion.Title>
            <Accordion.Content active={ subAccordionActiveIndex === 1 }>
                { showReCaptchaForUsernameRecovery }
            </Accordion.Content>
        </Accordion>
    );

    const notificationBasedPasswordRecoveryAccordion: ReactElement = (
        <Accordion data-testid={ `${ testId }-notification-based-password-recovery-accordion` }>
            <Accordion.Title
                active={ subAccordionActiveIndex === 2 }
                index={ 0 }
                onClick={ () => {
                    handleSubAccordionClick(2)
                } }
                className={ (accountRecoveryConfigs?.enableNotificationPasswordRecovery?.length > 0) ? "" : "disabled" }
            >
                <Grid className="middle aligned mt-1">
                    <Grid.Row columns={ 2 } className="inner-list-item">
                        <Grid.Column className="first-column">
                            <Icon
                                className="modal-icon"
                                name={ accountRecoveryConfigs?.enableReCaptchaForNotificationPasswordRecovery?.
                                    length > 0 ? "check circle" : "circle outline" }
                                size="large"
                                color={ (accountRecoveryConfigs.enableNotificationPasswordRecovery?.length > 0 &&
                                    accountRecoveryConfigs?.enableReCaptchaForNotificationPasswordRecovery?.length > 0)
                                    ? "orange" : "grey" }
                            />
                            { t("adminPortal:components.serverConfigs.accountRecovery." +
                                "passwordRecovery.form.enableReCaptchaForNotificationBasedRecovery.label") }
                        </Grid.Column>
                        <Grid.Column className="last-column pr-6" textAlign="right">
                            <GenericIcon
                                size="default"
                                defaultIcon
                                link
                                inline
                                transparent
                                verticalAlign="middle"
                                className="pr-3"
                                icon={ <Icon name="angle right" className="chevron"/> }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Accordion.Title>
            <Accordion.Content active={ subAccordionActiveIndex === 2 }>
                { showReCaptchaForNotificationPasswordRecovery }
            </Accordion.Content>
        </Accordion>
    );

    const securityBasedPasswordRecoveryAccordion: ReactElement = (
        <Accordion data-testid={ `${ testId }-security-based-password-recovery-accordion` }>
            <Accordion.Title
                active={ subAccordionActiveIndex === 3 }
                index={ 0 }
                onClick={ () => {
                    handleSubAccordionClick(3)
                } }
                className={ (accountRecoveryConfigs?.enableSecurityQuestionPasswordRecovery?.length > 0) ? "" :
                    "disabled" }
            >
                <Grid className="middle aligned mt-1">
                    <Grid.Row columns={ 2 } className="inner-list-item">
                        <Grid.Column className="first-column" mobile={ 12 } tablet={ 12 } computer={ 12 }>
                            <Icon
                                className="modal-icon"
                                name={ accountRecoveryConfigs?.enableReCaptchaForQuestionPasswordRecovery?.length > 0 ?
                                    "check circle" : "circle outline" }
                                size="large"
                                color={ (accountRecoveryConfigs.enableSecurityQuestionPasswordRecovery?.length > 0 &&
                                    accountRecoveryConfigs?.enableReCaptchaForQuestionPasswordRecovery?.length > 0)
                                    ? "orange" : "grey" }
                            />
                            { t("adminPortal:components.serverConfigs.accountRecovery.passwordRecovery.form." +
                                "enableReCaptchaForSecurityQuestionBasedRecovery.label") }
                        </Grid.Column>
                        <Grid.Column
                            className="last-column pr-6"
                            textAlign="right"
                            mobile={ 4 } tablet={ 4 } computer={ 4 }
                        >
                            <GenericIcon
                                size="default"
                                defaultIcon
                                link
                                inline
                                transparent
                                verticalAlign="middle"
                                className="pr-3"
                                icon={ <Icon name="angle right" className="chevron"/> }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Accordion.Title>
            <Accordion.Content active={ subAccordionActiveIndex === 3 }>
                { showQuestionPasswordRecoverySettings }
            </Accordion.Content>
        </Accordion>
    );

    const accountRecoveryView: ReactElement = (
        <Forms
            onSubmit={ (values) => {
                saveQuestionPasswordRecoverySettings(values);
            } }
        >
            <Grid padded={ true } className="middle aligned">
                <Grid.Row columns={ 2 } className="inner-list-item">
                    <Grid.Column className="first-column" mobile={ 14 } tablet={ 14 } computer={ 14 }>
                        <label>Username recovery</label>
                    </Grid.Column>
                    <Grid.Column mobile={ 2 } tablet={ 2 } computer={ 2 }>
                        <Field
                            name={ ServerConfigurationsConstants.USERNAME_RECOVERY_ENABLE }
                            required={ false }
                            requiredErrorMessage=""
                            type="checkbox"
                            children={ [
                                {
                                    label: "",
                                    value: ServerConfigurationsConstants.USERNAME_RECOVERY_ENABLE
                                }
                            ] }
                            value={ accountRecoveryConfigs.enableUsernameRecovery }
                            listen={
                                (values) => {
                                    const value = values.get(ServerConfigurationsConstants.
                                        USERNAME_RECOVERY_ENABLE).length > 0 ? "true" : "false";
                                    saveAccountRecoveryConfigs(ServerConfigurationsConstants.USERNAME_RECOVERY_ENABLE,
                                        value);
                                }
                            }
                            toggle
                            data-testid={ `${ testId }-form-enable-username-recovery-toggle` }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 } className="inner-list-item mt-3 mb-3">
                    <Grid.Column className="first-column">
                        { usernameRecoveryAccordion }
                    </Grid.Column>
                </Grid.Row>

                <Divider className="mr-5 ml-5"/>

                <Grid.Row columns={ 2 } className="inner-list-item">
                    <Grid.Column className="first-column" mobile={ 14 } tablet={ 14 } computer={ 14 }>
                        <label>Notification based password recovery</label>
                    </Grid.Column>
                    <Grid.Column mobile={ 2 } tablet={ 2 } computer={ 2 }>
                        <Field
                            name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE }
                            required={ false }
                            requiredErrorMessage=""
                            type="checkbox"
                            children={ [
                                {
                                    label: "",
                                    value: ServerConfigurationsConstants.PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE
                                }
                            ] }
                            value={ accountRecoveryConfigs.enableNotificationPasswordRecovery }
                            listen={
                                (values) => {
                                    const value = values.get(ServerConfigurationsConstants.
                                        PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE).length > 0 ? "true" : "false";
                                    saveAccountRecoveryConfigs(ServerConfigurationsConstants.
                                        PASSWORD_RECOVERY_NOTIFICATION_BASED_ENABLE, value);
                                }
                            }
                            toggle
                            data-testid={ `${ testId }-form-enable-notification-password-recovery-toggle` }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 } className="inner-list-item mt-3 mb-3">
                    <Grid.Column className="first-column">
                        { notificationBasedPasswordRecoveryAccordion }
                    </Grid.Column>
                </Grid.Row>

                <Divider className="mr-5 ml-5"/>

                <Grid.Row columns={ 2 } className="inner-list-item">
                    <Grid.Column className="first-column" mobile={ 14 } tablet={ 14 } computer={ 14 }>
                        <label>Security questions based password recovery</label>
                    </Grid.Column>
                    <Grid.Column mobile={ 2 } tablet={ 2 } computer={ 2 }>
                        <Field
                            name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_ENABLE }
                            required={ false }
                            requiredErrorMessage=""
                            type="checkbox"
                            children={ [
                                {
                                    label: "",
                                    value: ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_BASED_ENABLE
                                }
                            ] }
                            listen={
                                (values) => {
                                    const value = values.get(ServerConfigurationsConstants.
                                        PASSWORD_RECOVERY_QUESTION_BASED_ENABLE).length > 0 ? "true" : "false";
                                    saveAccountRecoveryConfigs(ServerConfigurationsConstants.
                                        PASSWORD_RECOVERY_QUESTION_BASED_ENABLE, value);
                                }
                            }
                            value={ accountRecoveryConfigs.enableSecurityQuestionPasswordRecovery }
                            toggle
                            data-testid={ `${ testId }-form-enable-security-question-password-recovery-toggle` }
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={ 1 } className="inner-list-item mt-3 mb-3">
                    <Grid.Column className="first-column">
                        { securityBasedPasswordRecoveryAccordion }
                    </Grid.Column>
                </Grid.Row>

                <Divider className="mr-5 ml-5" hidden/>

            </Grid>
        </Forms>
    );

    const showUserAccountRecoveryView: ReactElement = (
        <EditSection>
            <Forms
                onSubmit={ (values) => {
                    saveAccountRecoveryAdvancedConfigs(getFormValues(values));
                } }
                resetState={ reset }
            >
                <Grid>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Divider/>
                            <Field
                                name={ ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_FORCED_ENABLE }
                                required={ false }
                                requiredErrorMessage=""
                                type="checkbox"
                                children={ [
                                    {
                                        label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                            "otherSettings.form.enableForcedChallengeQuestions.label"),
                                        value: ServerConfigurationsConstants.PASSWORD_RECOVERY_QUESTION_FORCED_ENABLE
                                    }
                                ] }
                                value={ accountRecoveryConfigs.enableForcedChallengeQuestions }
                                data-testid={ `${ testId }-form-enable-forced-challenge-questions-checkbox` }
                            />
                            <Hint>
                                { t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.enableForcedChallengeQuestions.hint") }
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                label={ t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.reCaptchaMaxFailedAttempts.label") }
                                name={ ServerConfigurationsConstants.RE_CAPTCHA_MAX_FAILED_ATTEMPTS }
                                placeholder={ t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.reCaptchaMaxFailedAttempts.placeholder") }
                                required={ true }
                                requiredErrorMessage={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.reCaptchaMaxFailedAttempts.validations.empty") }
                                type="number"
                                value={ accountRecoveryConfigs.reCaptchaMaxFailedAttempts }
                                width={ 9 }
                                data-testid={ `${ testId }-form-recaptcha-max-failed-attempts-input` }
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                name={ ServerConfigurationsConstants.ACCOUNT_RECOVERY_NOTIFICATIONS_INTERNALLY_MANAGED }
                                required={ false }
                                requiredErrorMessage=""
                                type="checkbox"
                                children={ [
                                    {
                                        label: t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                            "form.enableInternalNotificationManagement.label"),
                                        value: ServerConfigurationsConstants.
                                            ACCOUNT_RECOVERY_NOTIFICATIONS_INTERNALLY_MANAGED
                                    }
                                ] }
                                listen={
                                    (values) => {
                                        setAccountRecoveryConfigs(getFormValues(values));
                                    }
                                }
                                value={ accountRecoveryConfigs.notificationInternallyManaged }
                                data-testid={ `${ testId }-form-enable-internal-notification-management-checkbox` }
                            />
                            <Hint>
                                { t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.enableInternalNotificationManagement.hint") }
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                name="NotificationCheckBoxes"
                                required={ false }
                                requiredErrorMessage=""
                                type="checkbox"
                                children={ [
                                    {
                                        label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                            "otherSettings.form.notifyRecoverySuccess.label"),
                                        value: ServerConfigurationsConstants.NOTIFY_SUCCESS
                                    },
                                    {
                                        label: t("adminPortal:components.serverConfigs.accountRecovery." +
                                            "otherSettings.form.notifyQuestionRecoveryStart.label"),
                                        value: ServerConfigurationsConstants.NOTIFY_RECOVERY_START
                                    }
                                ] }
                                value={ accountRecoveryConfigs.notificationCheckBoxes }
                                disabled={ accountRecoveryConfigs.notificationInternallyManaged?.length == 0 }
                                data-testid={ `${ testId }-form-notify-question-recovery-start-checkbox` }
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                label={ t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.recoveryLinkExpiryTime.label") }
                                name={ ServerConfigurationsConstants.RECOVERY_LINK_EXPIRY_TIME }
                                placeholder={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.recoveryLinkExpiryTime.placeholder") }
                                required={ true }
                                requiredErrorMessage={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.recoveryLinkExpiryTime.validations.empty") }
                                type="number"
                                value={ accountRecoveryConfigs.recoveryLinkExpiryTime }
                                width={ 9 }
                                data-testid={ `${ testId }-form-recovery-link-expiry-input` }
                            />
                            <Hint>
                                { t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.recoveryLinkExpiryTime.hint") }
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                label={ t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.smsOTPExpiryTime.label") }
                                name={ ServerConfigurationsConstants.RECOVERY_SMS_EXPIRY_TIME }
                                placeholder={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.smsOTPExpiryTime.placeholder") }
                                required={ true }
                                requiredErrorMessage={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.smsOTPExpiryTime.validations.empty") }
                                type="number"
                                value={ accountRecoveryConfigs.smsOTPExpiryTime }
                                width={ 9 }
                                data-testid={ `${ testId }-form-sms-otp-expiry-input` }
                            />
                            <Hint>
                                { t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.smsOTPExpiryTime.hint") }
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Field
                                label={ t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.recoveryCallbackURLRegex.label") }
                                name={ ServerConfigurationsConstants.RECOVERY_CALLBACK_REGEX }
                                placeholder={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.recoveryCallbackURLRegex.placeholder") }
                                required={ true }
                                requiredErrorMessage={ t("adminPortal:components.serverConfigs.accountRecovery." +
                                    "otherSettings.form.recoveryCallbackURLRegex.validations.empty") }
                                type="text"
                                value={ accountRecoveryConfigs.callbackRegex }
                                width={ 9 }
                                data-testid={ `${ testId }-form-recovery-callback-url-regex-input` }
                            />
                            <Hint>
                                { t("adminPortal:components.serverConfigs.accountRecovery.otherSettings." +
                                    "form.recoveryCallbackURLRegex.hint") }
                            </Hint>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={ 1 }>
                        <Grid.Column mobile={ 16 } tablet={ 16 } computer={ 14 }>
                            <Form.Group>
                                <Field
                                    name=""
                                    required={ false }
                                    requiredErrorMessage=""
                                    size="small"
                                    type="submit"
                                    value={ t("common:save").toString() }
                                    data-testid={ `${ testId }-form-submit-button` }
                                />
                            </Form.Group>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Forms>
        </EditSection>
    );

    const handleMainAccordionClick = () => {
        setMainAccordionActiveState(!mainAccordionActiveState)
    };

    const mainAccordion: ReactElement = (
        <Accordion fluid styled data-testid={ `${ testId }-main-accordion` }>
            <Accordion.Title
                active={ mainAccordionActiveState }
                index={ 0 }
                onClick={ handleMainAccordionClick }
            >
                <Grid className="middle aligned">
                    <Grid.Row columns={ 2 } className="inner-list-item">
                        <Grid.Column className="first-column">
                            <LinkButton className="p-3">Other Settings</LinkButton>
                        </Grid.Column>
                        <Grid.Column className="last-column" textAlign="right">
                            <GenericIcon
                                size="default"
                                defaultIcon
                                link
                                inline
                                transparent
                                verticalAlign="middle"
                                className="pr-3"
                                icon={ <Icon name="angle right" className="chevron"/> }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Accordion.Title>
            <Accordion.Content active={ mainAccordionActiveState }>
                { showUserAccountRecoveryView }
            </Accordion.Content>
        </Accordion>
    );

    return (
        <Section
            description={ t("adminPortal:components.serverConfigs.accountRecovery.description") }
            header={ t("adminPortal:components.serverConfigs.accountRecovery.heading") }
            icon={ SettingsSectionIcons.associatedAccounts }
            iconMini={ SettingsSectionIcons.associatedAccountsMini }
            iconSize="auto"
            iconStyle="colored"
            iconFloated="right"
            accordion={ mainAccordion }
            data-testid={ `${ testId }-section` }
        >
            <Divider className="m-0 mb-2"/>
            <div className="main-content-inner">
                { accountRecoveryView }
            </div>
        </Section>
    );
};

/**
 * Default props for the component.
 */
AccountRecovery.defaultProps = {
    "data-testid": "account-recovery"
};
