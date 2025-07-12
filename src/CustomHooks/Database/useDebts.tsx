import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "./useAccountRoute";
import {DebtModel} from "../../Data/DatabaseModels/DebtModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useDebts = () => {
    const getDatabaseRoute = useAccountRoute()
    const [debts, setDebts] = useState<DebtModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.DEBTS),
            setDebts
        )
    }, [getDatabaseRoute]);

    return debts
}