import React, {useEffect} from 'react';
import {AccountModel} from "../../../Data/Account/AccountModel";

import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import InputBaseComponent from "../../Components/Input/InputBase/InputBaseComponent";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import {AccountVisibility} from "../../../Data/Account/AccountVisibility";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {getDatabase} from "../../../Database/AceBaseDatabase";
import {useDialog} from "../../../Providers/DialogProvider";
import {
    addDBItem,
    deleteDBItem, getDBItemsOnChange,
    updateDBItem
} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {InputNameValueModel} from "../../../Data/Input/InputNameValueModel";
import {getInputValueUidsByUids} from "../../../Helper/HandyFunctionHelper";
import {CreateAccountInputErrorModel} from "../../../Data/Account/CreateAccountInputErrorModel";
// @ts-ignore
import variables from "../../../Data/Variables.scss";
import {useToast} from "../../../Providers/Toast/ToastProvider";

const CreateAccountDialog = ({
    account
 }: {
    account?: AccountModel
}) => {
    const dialog = useDialog()
    const toast = useToast()

    const accountVisibilityOptions = [
        new InputOptionModel("Private", AccountVisibility.PRIVATE),
        new InputOptionModel("Public", AccountVisibility.PUBLIC)
    ];

    const [workAccount, setWorkAccount] = React.useState<AccountModel>( structuredClone(account) || new AccountModel())
    const [transactionPartners, setTransactionPartners] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)
    const [inputError, setInputError] = React.useState<CreateAccountInputErrorModel>(new CreateAccountInputErrorModel())

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, (partners: TransactionPartnerModel[]) => {
            setTransactionPartners(partners.map(partner => new InputNameValueModel(partner.name, partner)))
        })
    }, []);

    const updateAccount = (updater: (oldAccount: AccountModel) => AccountModel) => {
        setWorkAccount((current) => {
            const newAccount = new AccountModel();
            Object.assign(newAccount, updater(current));
            return newAccount
        })
    }

    return (
        <DialogOverlay actions={account ? [
            new ContentAction(
                "Save",
                () => {
                    dialog.closeCurrent();
                    updateDBItem(DatabaseRoutes.ACCOUNTS, workAccount)
                },
            ),
            new ContentAction(
                "Delete",
                () => {
                    dialog.closeCurrent();
                    deleteDBItem(DatabaseRoutes.ACCOUNTS, workAccount)
                },
            ),
        ] : [
            new ContentAction(
                "Create",
                () => {
                    if (!workAccount.name) {
                        toast.open("Please enter an account name!")
                        setInputError((oldError) => {
                            const newError = new CreateAccountInputErrorModel();
                            Object.assign(newError, new CreateAccountInputErrorModel(true));
                            return newError;
                        })
                        return;
                    }

                    addDBItem(DatabaseRoutes.ACCOUNTS, workAccount).then(() => {
                        dialog.closeCurrent()
                    })
                },
            )
        ]}>
            <TextInputComponent
                title="Account name"
                value={workAccount.name}
                onValueChange={(value) => updateAccount((oldAccount) => {
                    oldAccount.name = value as string;
                    return oldAccount;
                })}
                style={{
                    borderColor: inputError.nameError ? variables.errorColor : null
                }}
            />
            <CurrencyInputComponent
                title="Account balance"
                value={workAccount.balance || 0}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.balance = value;
                        return oldAccount;
                    });
                }}
            />
            <RadioInputComponent
                title="Visibility"
                value={accountVisibilityOptions.find(option => option.value === workAccount.visibility)!}
                onValueChange={(value) => {
                    updateAccount((oldAccount) => {
                        oldAccount.visibility = (value as InputOptionModel<AccountVisibility>).value;
                        return oldAccount;
                    });
                }}
                options={accountVisibilityOptions}
            />
            { workAccount.visibility === AccountVisibility.PUBLIC &&
                <AutoCompleteInputComponent
                    title="Participans"
                    value={getInputValueUidsByUids(workAccount.userIds || [], transactionPartners) || []}
                    onValueChange={(value) => {
                        updateAccount((oldAccount) => {
                            oldAccount.userIds = (value as InputNameValueModel<TransactionPartnerModel>[]).map(option => option.value?.uid!);
                            return oldAccount;
                        });
                    }}
                    placeholder={"Add participants ..."}
                    suggestions={transactionPartners}
                />
            }
        </DialogOverlay>
    );
};

export default CreateAccountDialog;