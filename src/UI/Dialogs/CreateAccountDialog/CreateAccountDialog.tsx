import React, {useEffect, useState} from 'react';
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";

import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {AccountVisibilityType} from "../../../Data/EnumTypes/AccountVisibilityType";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {getInputValueUidsByUids} from "../../../Helper/HandyFunctionHelper";
import {CreateAccountInputErrorModel} from "../../../Data/ErrorModels/CreateAccountInputErrorModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {CurrencyModel} from "../../../Data/DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useDatabaseRoute} from "../../../CustomHooks/Database/useDatabaseRoute";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import {getDefaultDebtPresets, getDefaultPresets} from "../../../Helper/DefaultPresetHelper";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";

const CreateAccountDialog = ({
    account
 }: {
    account?: AccountModel
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const dialog = useDialog()
    const toast = useToast()

    const getDatabaseRoute = useDatabaseRoute(false)

    const settings = useSettings()

    const accountVisibilityOptions = [
        new InputOptionModel(translate("private"), AccountVisibilityType.PRIVATE),
        new InputOptionModel(translate("public"), AccountVisibilityType.PUBLIC)
    ];

    const accountTypeOptions = [
        new InputOptionModel(translate("default"), AccountType.DEFAULT),
        new InputOptionModel(translate("debts"), AccountType.DEBTS)
    ];

    const [workAccount, setWorkAccount] = React.useState<AccountModel>( structuredClone(account) || new AccountModel())
    const [inputError, setInputError] = React.useState<CreateAccountInputErrorModel>(new CreateAccountInputErrorModel())

    const accounts = useAccounts()

    const transactionPartners = useTransactionPartners()
    const [transactionPartnerInputOptions, setTransactionPartnerInputOptions] = useState<InputNameValueModel<TransactionPartnerModel>[]>([])

    useEffect(() => {
        if (transactionPartners) {
            setTransactionPartnerInputOptions(
                transactionPartners.map(partner => new InputNameValueModel<TransactionPartnerModel>(partner.name, partner))
            )
        }
    }, [transactionPartners])

    const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyModel | null>(null)

    useEffect(() => {
        setSelectedCurrency(
            {
                ...getDefaultCurrency(currentAccount?.currencyCode),
                currencyCode: workAccount.currencyCode || getDefaultCurrency(null).currencyCode
            }
        )
    }, [currentAccount]);

    useEffect(() => {
        updateAccount((oldAccount) => {
            oldAccount.currencyCode = selectedCurrency?.currencyCode || getDefaultCurrency(null).currencyCode
            return oldAccount;
        })
    }, [selectedCurrency]);

    const updateAccount = (updater: (oldAccount: AccountModel) => AccountModel) => {
        setWorkAccount((current) => {
            const newAccount = new AccountModel();
            Object.assign(newAccount, updater(current));
            return newAccount
        })
    }

    return (
        <DialogOverlay actions={account ? [
            ...(workAccount.uid !== currentAccount?.uid) ? [
                new ContentAction(
                    translate("switch"),
                    () => {
                        dialog.closeCurrent();
                        getActiveDatabaseHelper().setDBObject(
                            DatabaseRoutes.SETTINGS,
                            {
                                ...settings,
                                currentAccountUid: workAccount.uid
                            }
                        )
                    },
                ),
            ] : [],
            new ContentAction(
                translate("save"),
                () => {
                    dialog.closeCurrent();
                    if (workAccount.balance === null) workAccount.balance = 0;
                    getActiveDatabaseHelper().updateDBItem(getDatabaseRoute!(DatabaseRoutes.ACCOUNTS), workAccount)
                },
                false,
                !getDatabaseRoute
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (accounts!.length === 1) {
                        toast.open(translate("there-must-be-at-least-one-account"))
                        return;
                    } else if (workAccount.uid === currentAccount?.uid) {
                        getActiveDatabaseHelper().setDBObject(DatabaseRoutes.SETTINGS, {
                            ...settings,
                            currentAccountUid: accounts!.filter(account => account.uid !== workAccount.uid)[0].uid
                        })
                    }

                    getActiveDatabaseHelper().deleteDBItem(getDatabaseRoute!(DatabaseRoutes.ACCOUNTS), workAccount)
                    dialog.closeCurrent();
                },
                false,
                !getDatabaseRoute || !accounts || !currentAccount
            ),
        ] : [
            new ContentAction(
                translate("create"),
                () => {
                    if (!workAccount.name) {
                        toast.open(translate("please-enter-an-account-name!"))
                        setInputError((oldError) => {
                            const newError = new CreateAccountInputErrorModel();
                            Object.assign(newError, new CreateAccountInputErrorModel(true));
                            return newError;
                        })
                        return;
                    }
                    if (workAccount.balance === null) workAccount.balance = 0;
                    getActiveDatabaseHelper().addDBItem(getDatabaseRoute!(DatabaseRoutes.ACCOUNTS), workAccount).then((newAccount) => {
                        const castedAccount = newAccount as AccountModel;

                        let presets

                        if (castedAccount.type === AccountType.DEFAULT) {
                            presets = getDefaultPresets(castedAccount.currencyCode, castedAccount.uid)
                        } else {
                            presets = getDefaultDebtPresets(castedAccount.currencyCode, castedAccount.uid)
                        }

                        presets.forEach(preset => {
                            getActiveDatabaseHelper().addDBItem(
                                getDatabaseRoute!(DatabaseRoutes.ACCOUNTS) + "/" + castedAccount.uid + "/" + DatabaseRoutes.PRESETS,
                                preset
                            ).then(() => {
                                dialog.closeCurrent()
                            })
                        })
                    })
                },
                false,
                !getDatabaseRoute
            )
        ]}>
            <TextInputComponent
                title={translate("account-name")}
                value={workAccount.name}
                onValueChange={(value) => updateAccount((oldAccount) => {
                    oldAccount.name = value as string;
                    return oldAccount;
                })}
                style={{
                    borderColor: inputError.nameError ? "var(--error-color)" : "null"
                }}
            />
            <RadioInputComponent
                title={translate("account-type")}
                value={accountTypeOptions.find(option => option.value === workAccount.type)!}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.type = (value as InputOptionModel<AccountType>).value;
                        return oldAccount;
                    });
                }}
                options={accountTypeOptions}
                disabled={account !== undefined}
            />
            { workAccount.type === AccountType.DEFAULT && <CurrencyInputComponent
                title={translate("account-balance")}
                value={workAccount.balance}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.balance = value;
                        return oldAccount;
                    });
                }}
                currency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                currencyRateIsDisabled={true}
                allowNegativeValue={true}
            /> }
            <RadioInputComponent
                title={translate("account-visibility")}
                value={accountVisibilityOptions.find(option => option.value === workAccount.visibility)!}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.visibility = (value as InputOptionModel<AccountVisibilityType>).value;
                        return oldAccount;
                    });
                }}
                options={accountVisibilityOptions}
            />
            { workAccount.visibility === AccountVisibilityType.PUBLIC &&
                <AutoCompleteInputComponent
                    title={translate("participants")}
                    value={getInputValueUidsByUids(workAccount.userIds || [], transactionPartnerInputOptions || []) || []}
                    onValueChange={(value) => {
                        updateAccount((oldAccount) => {
                            oldAccount.userIds = (value as InputNameValueModel<TransactionPartnerModel>[]).map(option => option.value?.uid!);
                            return oldAccount;
                        });
                    }}
                    placeholder={translate("add-participant")}
                    suggestions={transactionPartnerInputOptions}
                />
            }
        </DialogOverlay>
    );
};

export default CreateAccountDialog;