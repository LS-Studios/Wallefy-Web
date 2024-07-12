import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";

export const useDebts = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [debts, setDebts] = useState<DebtModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.DEBTS),
            setDebts
        )
    }, [getDatabaseRoute]);

    return debts
}