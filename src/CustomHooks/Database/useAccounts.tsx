import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {AccountModel} from "../../Data/DatabaseModels/AccountModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useAccounts = () => {
    const getDatabaseRoute = useDatabaseRoute(false)
    const [accounts, setAccounts] = useState<AccountModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.ACCOUNTS),
            setAccounts
        )
    }, [getDatabaseRoute]);

    return accounts
}