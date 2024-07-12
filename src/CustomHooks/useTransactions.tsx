import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";

export const useTransactions = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [transactions, setTransactions] = useState<TransactionModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
            setTransactions
        )
    }, [getDatabaseRoute]);

    return transactions
}