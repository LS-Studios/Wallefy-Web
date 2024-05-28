import React, {useEffect} from 'react';
import {AccountModel} from "../../../Data/Account/AccountModel";
import {AccountVisibility} from "../../../Data/Account/AccountVisibility";
import Account from "./Account/Account";
import {getDatabase} from "../../../Database/AceBaseDatabase";
import {DataSnapshot} from "acebase";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";

const AccountsScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const [accounts, setAccounts] = React.useState<AccountModel[]>([])

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.ACCOUNTS, setAccounts)
    }, []);

    return (
        <div className="list-screen">
            <div className="screen-list-items">
                {
                    accounts.filter((account) => account.name.toLowerCase().includes(searchValue.toLowerCase())).map((account, index) => (
                        <Account key={index} account={account} />
                    ))
                }
            </div>
        </div>
    );
};

export default AccountsScreen;