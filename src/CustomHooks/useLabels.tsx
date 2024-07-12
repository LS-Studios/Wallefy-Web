import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {LabelModel} from "../Data/DatabaseModels/LabelModel";
import {useDatabaseRoute} from "./useDatabaseRoute";

export const useLabels = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [labels, setLabels] = useState<LabelModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.LABELS),
            setLabels
        )
    }, [getDatabaseRoute]);

    return labels
}