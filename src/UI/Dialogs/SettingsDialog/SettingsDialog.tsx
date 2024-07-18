import React, {useEffect, useState} from 'react';
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import ButtonInputComponent from "../../Components/Input/ButtonInput/ButtonInputComponent";
import "./SettingsDialog.scss";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {SettingsModel} from "../../../Data/DataModels/SettingsModel";
import {ThemeType} from "../../../Data/EnumTypes/ThemeType";
import {LanguageType} from "../../../Data/EnumTypes/LanguageType";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import ExportDialog from "../ExportDialog";
import ImportDialog from "../ImportDialog";
import DeleteDialog from "../DeleteDialog";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import {DatabaseType} from "../../../Data/EnumTypes/DatabaseType";

const SettingsDialog = () => {
    const dialog = useDialog()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const settings = useSettings()

    const themeOptions: InputOptionModel<ThemeType>[] = [
        new InputOptionModel(translate("light"), ThemeType.LIGHT),
        new InputOptionModel(translate("dark"), ThemeType.DARK),
        new InputOptionModel(translate("system"), ThemeType.SYSTEM),
    ];

    const languageOptions: InputOptionModel<LanguageType>[] = [
        new InputOptionModel(translate("english"), LanguageType.ENGLISH),
        new InputOptionModel(translate("german"), LanguageType.GERMAN),
    ];

    const [selectedTheme, setSelectedTheme] = React.useState<InputOptionModel<ThemeType>>(
        themeOptions[0]
    );
    const [selectedLanguage, setSelectedLanguage] = React.useState<InputOptionModel<LanguageType>>(
        languageOptions[0]
    );
    const [selectedAccount, setSelectedAccount] = React.useState<InputNameValueModel<AccountModel> | null>(null);

    const [fetchedInitialData, setFetchedInitialData] = useState<boolean>(false)

    const accounts = useAccounts()
    const [accountsForSelection, setAccountsForSelection] = useState<InputNameValueModel<AccountModel>[] | null>(null)

    useEffect(() => {
        if (accounts) {
            setAccountsForSelection(accounts.map(account => new InputNameValueModel(account.name, account)))
        }
    }, [accounts])

    useEffect(() => {
        if (!accountsForSelection || fetchedInitialData) return

        getActiveDatabaseHelper(DatabaseType.ACE_BASE).getDBObject(DatabaseRoutes.SETTINGS).then((settings: SettingsModel) => {
            if (settings) {
                setSelectedTheme(themeOptions.find(option => option.value === settings.theme) || themeOptions[0])
                setSelectedLanguage(languageOptions.find(option => option.value === settings.language) || languageOptions[0])
                setSelectedAccount(accountsForSelection.find(account => account.value?.uid === settings.currentAccountUid) || null)
            }
            setFetchedInitialData(true)
        })
    }, [settings, accountsForSelection]);

    useEffect(() => {
        if (!settings || !selectedAccount || !fetchedInitialData) return;

        const newSettings = new SettingsModel(
            settings.currentUserUid,
            selectedAccount?.value!.uid,
            selectedTheme.value,
            selectedLanguage.value
        )

        getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(
            DatabaseRoutes.SETTINGS,
            newSettings
        ).then((s) => {

        })
    }, [selectedTheme, selectedLanguage, selectedAccount])

    return (
        <DialogOverlay actions={[]}>
            <RadioInputComponent
                title={translate("theme")}
                value={selectedTheme}
                onValueChange={(newTheme) => {
                    setSelectedTheme(newTheme as InputOptionModel<ThemeType>);
                }}
                options={themeOptions}
            />
            <RadioInputComponent
                title={translate("language")}
                value={selectedLanguage}
                onValueChange={(newLanguage) => {
                    setSelectedLanguage(newLanguage as InputOptionModel<LanguageType>);
                }}
                options={languageOptions}
            />
            <AutoCompleteInputComponent
                title={translate("current-account")}
                value={selectedAccount}
                onValueChange={(newAccount) => {
                    setSelectedAccount(newAccount as InputNameValueModel<AccountModel>)
                }}
                suggestions={accountsForSelection}
                selectAtLeastOne={true}
            />
            <ButtonInputComponent
                text={translate("export-data")}
                onClick={() => {
                    dialog.open(
                        new DialogModel(
                            translate("export-data"),
                            <ExportDialog />
                        )
                    )
                }}
            />
            <ButtonInputComponent
                text={translate("import-data")}
                onClick={() => {
                    dialog.open(
                        new DialogModel(
                            translate("import-data"),
                            <ImportDialog />
                        )
                    )
                }}
            />
            <ButtonInputComponent
                text={translate("delete-data")}
                onClick={() => {
                    dialog.open(
                        new DialogModel(
                            translate("delete-data"),
                            <DeleteDialog />
                        )
                    )
                }}
            />
            <ButtonInputComponent
                text={translate("logout")}
                onClick={() => {
                    getActiveDatabaseHelper().dbLogout().then(() => {
                        dialog.closeCurrent()
                    })
                }}
            />
            <ButtonInputComponent
                text={translate("delete-user-account")}
                onClick={() => {
                    if (!settings) return;
                    getActiveDatabaseHelper(DatabaseType.ACE_BASE).setDBObject(DatabaseRoutes.SETTINGS, new SettingsModel())
                    getActiveDatabaseHelper().deleteDBItemByUid(DatabaseRoutes.USERS, settings.currentUserUid)
                    dialog.closeCurrent()
                }}
            />

        </DialogOverlay>
    );
};

export default SettingsDialog;