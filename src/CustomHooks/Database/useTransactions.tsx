import {TransactionModel} from "../../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useTransactions = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [transactions, setTransactions] = useState<TransactionModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
            setTransactions
        )
    }, [getDatabaseRoute]);

    return transactions
}