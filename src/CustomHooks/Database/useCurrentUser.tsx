import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {TransactionPresetModel} from "../../Data/DatabaseModels/TransactionPresetModel";
import {useAccountRoute} from "./useAccountRoute";
import {DebtPresetModel} from "../../Data/DatabaseModels/DebtPresetModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";
import {useSettings} from "../../Providers/SettingsProvider";
import {useUserDataRoute} from "./useUserDataRoute";

export const useCurrentUser = () => {
    const settings = useSettings()
    const getDatabaseRoute = useUserDataRoute()

    const [currentUser, setCurrentUser] = useState<UserDataModel | null>(null);

    useEffect(() => {
        if (!getDatabaseRoute || !settings) return

        getActiveDatabaseHelper().getDBObjectOnChange(
            getDatabaseRoute(),
            setCurrentUser
        )
    }, [getDatabaseRoute, settings]);

    return currentUser
}