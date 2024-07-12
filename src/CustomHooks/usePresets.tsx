import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {useEffect, useState} from "react";
import {getDBItemsOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {TransactionPresetModel} from "../Data/DatabaseModels/TransactionPresetModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {DebtPresetModel} from "../Data/DatabaseModels/DebtPresetModel";

export const usePresets = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [presets, setPresets] = useState<(TransactionPresetModel | DebtPresetModel)[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.PRESETS),
            setPresets
        )
    }, [getDatabaseRoute]);

    return presets
}