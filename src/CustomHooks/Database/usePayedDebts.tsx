import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {DebtModel} from "../../Data/DatabaseModels/DebtModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const usePayedDebts = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [payedDebts, setPayedDebts] = useState<DebtModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.PAYED_DEBTS),
            setPayedDebts
        )
    }, [getDatabaseRoute]);

    return payedDebts
}