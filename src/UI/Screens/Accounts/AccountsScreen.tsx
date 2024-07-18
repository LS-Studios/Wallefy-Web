import React, {useEffect} from 'react';
import Account from "./Account/Account";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";

const AccountsScreen = ({
    searchValue,
}: {
    searchValue: string,
}) => {
    const translate = useTranslation()
    const accounts = useAccounts()

    const [filteredAccounts, setFilteredAccounts] = React.useState<AccountModel[]>([])

    useEffect(() => {
        if (!accounts) return

        setFilteredAccounts(accounts.filter(account => account.name.toLowerCase().includes(searchValue.toLowerCase())))
    }, [accounts, searchValue]);

    return (
        <div className="list-screen">
            <div className="screen-list-items">
                {
                    accounts !== null ? (
                        filteredAccounts.length > 0 ? filteredAccounts.map((account, index) => (
                            <Account key={index} account={account} />
                        )) : <span className="no-items">{translate("no-accounts-found")}</span>
                    ) : <Spinner type={SpinnerType.CYCLE} />
                }
            </div>
        </div>
    );
};

export default AccountsScreen;