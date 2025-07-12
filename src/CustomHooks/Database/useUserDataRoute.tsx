import {useSettings} from "../../Providers/SettingsProvider";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useMemo} from "react";
import {useCurrentUser} from "./useCurrentUser";
import AccountsScreen from "../../UI/Screens/Accounts/AccountsScreen";
import {AccountVisibilityType} from "../../Data/EnumTypes/AccountVisibilityType";

export const useUserDataRoute = () => {
    const settings = useSettings()

    const getUserDataRoute = (databaseRoute?: DatabaseRoutes) => {
        const route = databaseRoute ? `/${databaseRoute}` : ``
        return `${DatabaseRoutes.USER_DATA}/${settings?.currentUserUid}${route}`
    }

    const value = useMemo(() => getUserDataRoute, [settings])

    if (!settings || !settings.currentUserUid) return null

    return value
}