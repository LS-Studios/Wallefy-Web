import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {CashCheckModel} from "../Data/DataModels/CashCheckModel";

export const usePayedDebts = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [payedDebts, setPayedDebts] = useState<DebtModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.PAYED_DEBTS),
            setPayedDebts
        )
    }, [getDatabaseRoute]);

    return payedDebts
}