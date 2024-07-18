import {useSettings} from "../../Providers/SettingsProvider";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useMemo} from "react";

export const useDatabaseRoute = (isPartOfAccount: boolean = true) => {
    const settings = useSettings()

    const getDatabaseRoute = (databaseRoute: DatabaseRoutes) => {
        return `${DatabaseRoutes.USERS}/${settings!.currentUserUid}${isPartOfAccount ? `/${DatabaseRoutes.ACCOUNTS}/${settings!.currentAccountUid}` : ""}/${databaseRoute}`
    }

    const value = useMemo(() => getDatabaseRoute, [settings])

    if (!settings || !settings.currentUserUid) return

    return value
}