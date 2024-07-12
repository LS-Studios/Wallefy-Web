import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {LabelModel} from "../Data/DatabaseModels/LabelModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";

export const useAccounts = () => {
    const getDatabaseRoute = useDatabaseRoute(false)
    const [accounts, setAccounts] = useState<AccountModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.ACCOUNTS),
            setAccounts
        )
    }, [getDatabaseRoute]);

    return accounts
}