import React, {useEffect} from 'react';
import Account from "./Account/Account";
import {useAccounts} from "../../../CustomHooks/useAccounts";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {getDBObject} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";

const AccountsScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const translate = useTranslation()
    const accounts = useAccounts()

    return (
        <div className="list-screen">
            <div className="screen-list-items">
                {
                    accounts !== null ? (
                        accounts.length > 0 ? accounts.filter((account) => account.name.toLowerCase().includes(searchValue.toLowerCase())).map((account, index) => (
                            <Account key={index} account={account} />
                        )) : <span className="no-items">{translate("no-accounts-found")}</span>
                    ) : <Spinner type={SpinnerType.CYCLE} />
                }
            </div>
        </div>
    );
};

export default AccountsScreen;