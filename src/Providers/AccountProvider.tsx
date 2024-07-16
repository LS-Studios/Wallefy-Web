import React, {useState, useMemo, PropsWithChildren, useContext, useEffect} from 'react';
import uuid from "react-uuid";
import {DialogModel} from "../Data/DataModels/DialogModel";
import DialogBase from "../UI/Provider/DialogBase/DialogBase";
import {AccountContext, ContextMenuContext, DialogContext, SettingsContext} from "./Contexts";
import {ContextMenuModel} from "../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../UI/Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../Data/ContentAction/ContentAction";
import {SettingsModel} from "../Data/DataModels/SettingsModel";
import {
    getDBItemByUid,
    getDBItemOnChange,
    getDBObjectOnChange,
    setDBObject,
    updateDBItem
} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {useSettings} from "./SettingsProvider";
import {useDatabaseRoute} from "../CustomHooks/useDatabaseRoute";
import {DataSnapshot, EventStream} from "acebase";

export interface AccountProviderProps {
    currentAccount: AccountModel | null,
    updateAccountBalance: (newBalance: number) => void
}

export const AccountProvider = ({ children }: PropsWithChildren) => {
    const settings = useSettings()
    const getDatabaseRoute = useDatabaseRoute(false)
    const [currentAccount, setCurrentAccount] = useState<AccountModel | null>(null);

    useEffect(() => {
        if (!settings || !getDatabaseRoute) return

        if (!settings.currentAccountUid) {
            setCurrentAccount(null)
            return;
        }

        getDBItemOnChange(getDatabaseRoute(DatabaseRoutes.ACCOUNTS), settings.currentAccountUid, (account) => {
            setCurrentAccount(account as AccountModel)
        })
    }, [settings, getDatabaseRoute])

    const updateAccountBalance = (newBalance: number) => {
        if (!getDatabaseRoute || !currentAccount) return

        setDBObject(
            getDatabaseRoute(DatabaseRoutes.ACCOUNTS) + "/" + currentAccount.uid + "/balance",
            newBalance
        )
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