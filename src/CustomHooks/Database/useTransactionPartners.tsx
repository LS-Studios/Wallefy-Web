import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../Data/DatabaseModels/TransactionPartnerModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useTransactionPartners = (initial: TransactionPartnerModel[] | null = null) => {
    const getDatabaseRoute = useDatabaseRoute()
    const [transactionPartners, setTransactionPartners] = useState<TransactionPartnerModel[] | null>(initial);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTION_PARTNERS),
            setTransactionPartners
        )
    }, [getDatabaseRoute]);

    return transactionPartners
}