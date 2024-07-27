import React, {PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';
import {AccountContext} from "./Contexts";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {useSettings} from "./SettingsProvider";
import {useAccountRoute} from "../CustomHooks/Database/useAccountRoute";
import {getActiveDatabaseHelper} from "../Helper/Database/ActiveDBHelper";
import {AccountVisibilityType} from "../Data/EnumTypes/AccountVisibilityType";
import {useAccountsRoute} from "../CustomHooks/Database/useAccountsRoute";

export interface AccountProviderProps {
    currentAccount: AccountModel | null,
    updateAccountBalance: (newBalance: number) => void
}

export const AccountProvider = ({ children }: PropsWithChildren) => {
    const settings = useSettings()
    const getDatabaseRoute = useAccountsRoute()
    const [currentAccount, setCurrentAccount] = useState<AccountModel | null>(null);

    useEffect(() => {
        if (!settings || !getDatabaseRoute) return

        if (!settings.currentAccountUid) {
            setCurrentAccount(null)
            return;
        }

        getActiveDatabaseHelper().getDBItemOnChange(getDatabaseRoute(), settings.currentAccountUid, (account) => {
            setCurrentAccount(account as AccountModel | null)
        })
    }, [settings, getDatabaseRoute])

    const updateAccountBalance = (newBalance: number) => {
        if (!getDatabaseRoute || !currentAccount) return

        if (currentAccount.visibility === AccountVisibilityType.PRIVATE) {
            getActiveDatabaseHelper().setDBObject(
                getDatabaseRoute() + "/" + currentAccount.uid + "/balance",
                newBalance
            )
        } else {
            getActiveDatabaseHelper().setDBObject(
                DatabaseRoutes.PUBLIC_ACCOUNTS + "/" + currentAccount.uid + "/balance",
                newBalance
            )
        }
    }

    const value: AccountProviderProps = useMemo(() => ({
        currentAccount,
        updateAccountBalance
    }), [currentAccount]);

    return (
        <AccountContext.Provider value={value}>
            { children }
        </AccountContext.Provider>
    );
};

export const useCurrentAccount = (): AccountProviderProps => useContext(AccountContext);