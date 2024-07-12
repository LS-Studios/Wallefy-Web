import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../Data/DatabaseModels/TransactionPartnerModel";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useDatabaseRoute} from "./useDatabaseRoute";

export const useTransactionPartners = (initial: TransactionPartnerModel[] | null = null) => {
    const getDatabaseRoute = useDatabaseRoute()
    const [transactionPartners, setTransactionPartners] = useState<TransactionPartnerModel[] | null>(initial);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTION_PARTNERS),
            setTransactionPartners
        )
    }, [getDatabaseRoute]);

    return transactionPartners
}