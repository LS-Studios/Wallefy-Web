import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";

export const useHistoryTransactions = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [historyTransactions, setHistoryTransactions] = useState<TransactionModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.HISTORY_TRANSACTIONS),
            setHistoryTransactions
        )
    }, [getDatabaseRoute]);

    return historyTransactions
}