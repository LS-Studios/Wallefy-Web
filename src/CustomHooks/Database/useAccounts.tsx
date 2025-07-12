import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "./useAccountRoute";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";
import {useSettings} from "../../Providers/SettingsProvider";
import {AccountVisibilityType} from "../../Data/EnumTypes/AccountVisibilityType";
import {useAccountsRoute} from "./useAccountsRoute";

export const useAccounts = () => {
    const settings = useSettings()
    const getDatabaseRoute = useAccountsRoute(AccountVisibilityType.PRIVATE)

    const [accounts, setAccounts] = useState<AccountModel[] | null>(null);
    const [privateAccounts, setPrivateAccounts] = useState<AccountModel[] | null>(null);
    const [publicAccounts, setPublicAccounts] = useState<AccountModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute || !settings) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(),
            setPrivateAccounts
        )
        getActiveDatabaseHelper().getDBObjectsOnChange(
            DatabaseRoutes.PUBLIC_ACCOUNT_USERS,
            (userLinks) => {
                if (!userLinks) {
                    setPublicAccounts([])
                    return
                }

                const accountsForUser = (Object.values(userLinks) as string[]).reduce((result: string[], userLink) => {
                    const userUids = Object.keys(userLink)
                    const accountUids = Object.values(userLink) as string[]
                    userUids.forEach((userUid, index) => {
                        if (userUid === settings.currentUserUid) {
                            result.push(accountUids[index])
                        }
                    })
                    return result
                }, [])

                setPublicAccounts([])

                accountsForUser.forEach(accountId => {
                    getActiveDatabaseHelper().getDBObjectOnChange(
                        `${DatabaseRoutes.PUBLIC_ACCOUNTS}/${accountId}`,
                        (account: AccountModel) => {
                            if (account) {
                                setPublicAccounts((prev) => {
                                    if (!prev) return [account]

                                    const index = prev.findIndex(acc => acc.uid === account.uid);

                                    if (index !== -1) {
                                        const updatedAccounts = [...prev];
                                        updatedAccounts[index] = account;
                                        return updatedAccounts;
                                    }

                                    return [...prev, account];
                                })
                            }
                        }
                    )
                })
            })
    }, [getDatabaseRoute, settings])

    useEffect(() => {
        if (!privateAccounts || !publicAccounts) return
        setAccounts(privateAccounts.concat(publicAccounts))
    }, [privateAccounts, publicAccounts]);

    return accounts
}