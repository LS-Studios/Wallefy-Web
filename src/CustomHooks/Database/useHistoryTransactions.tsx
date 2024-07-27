import {TransactionModel} from "../../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "./useAccountRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useHistoryTransactions = () => {
    const getDatabaseRoute = useAccountRoute()
    const [historyTransactions, setHistoryTransactions] = useState<TransactionModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.HISTORY_TRANSACTIONS),
            setHistoryTransactions
        )
    }, [getDatabaseRoute]);

    return historyTransactions
}