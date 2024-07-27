import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {LabelModel} from "../../Data/DatabaseModels/LabelModel";
import {useAccountRoute} from "./useAccountRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

export const useLabels = () => {
    const getDatabaseRoute = useAccountRoute()
    const [labels, setLabels] = useState<LabelModel[] | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemsOnChange(
            getDatabaseRoute(DatabaseRoutes.LABELS),
            setLabels
        )
    }, [getDatabaseRoute]);

    return labels
}