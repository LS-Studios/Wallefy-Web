import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {TransactionPresetModel} from "../../Data/DatabaseModels/TransactionPresetModel";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {DebtPresetModel} from "../../Data/DatabaseModels/DebtPresetModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const usePresets = () => {
    const getDatabaseRoute = useDatabaseRoute()
    const [presets, setPresets] = useState<(TransactionPresetModel | DebtPresetModel)[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.PRESETS),
            setPresets
        )
    }, [getDatabaseRoute]);

    return presets
}