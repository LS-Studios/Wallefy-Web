import React from 'react';
import {AccountModel} from "../../../../Data/Account/AccountModel";

import './Account.scss';
// @ts-ignore
import variables from "../../../../Data/Variables.scss";
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import {useDialog} from "../../../../Providers/DialogProvider";
import CreateAccountDialog from "../../../Dialogs/CreateAccountDialog/CreateAccountDialog";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import {AccountVisibility} from "../../../../Data/Account/AccountVisibility";
import {MdPeople, MdPerson} from "react-icons/md";

const Account = ({
     account
 }: {
    account: AccountModel
}) => {
    const dialog = useDialog()

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
        <div className="account" onClick={openAccountDialog}>
            <div className="account-head">
                {account.visibility === AccountVisibility.PUBLIC ? <MdPeople /> : <MdPerson />}
                <span id="account-name">{account.name}</span>
            </div>
            <span id="account-balance">{formatCurrency(account.balance || 0, account.currencyCode)}</span>
        </div>
    );
};

export default Account;