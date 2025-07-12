import React from 'react';
import {AccountModel} from "../../../../Data/DatabaseModels/AccountModel";

import './Account.scss';
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import {useDialog} from "../../../../Providers/DialogProvider";
import CreateAccountDialog from "../../../Dialogs/CreateAccountDialog/CreateAccountDialog";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import {AccountVisibilityType} from "../../../../Data/EnumTypes/AccountVisibilityType";
import {MdPeople, MdPerson} from "react-icons/md";
import {useSettings} from "../../../../Providers/SettingsProvider";

const Account = ({
     account,
 }: {
    account: AccountModel
}) => {
    const dialog = useDialog()

    const settings = useSettings()

    const openAccountDialog = () => {
        dialog.open(
            new DialogModel(
                "Edit account",
                <CreateAccountDialog
                    account={account}
                />
            )
        )
    }

    return (
        <div className={"account " + (settings?.currentAccountUid === account.uid ? "active" : "")} onClick={openAccountDialog}>
            <div className="account-head">
                {account.visibility === AccountVisibilityType.PUBLIC ? <MdPeople /> : <MdPerson />}
                <span id="account-name">{account.name}</span>
            </div>
            <span id="account-balance">{formatCurrency(account.balance || 0, settings?.language, account.currencyCode)}</span>
        </div>
    );
};

export default Account;