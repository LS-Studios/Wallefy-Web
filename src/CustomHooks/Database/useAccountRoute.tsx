import {useSettings} from "../../Providers/SettingsProvider";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useMemo} from "react";
import {useCurrentUser} from "./useCurrentUser";
import AccountsScreen from "../../UI/Screens/Accounts/AccountsScreen";
import {AccountVisibilityType} from "../../Data/EnumTypes/AccountVisibilityType";

export const useAccountRoute = (accountVisibility?: AccountVisibilityType) => {
    const settings = useSettings()

    const getAccountRoute = (databaseRoute?: DatabaseRoutes) => {
        const route = databaseRoute ? `/${databaseRoute}` : ``
        if ((accountVisibility || settings?.currentAccountVisibility) === AccountVisibilityType.PRIVATE) {
            return `${DatabaseRoutes.USER_ACCOUNTS}/${settings!.currentUserUid}/${DatabaseRoutes.PRIVATE_ACCOUNTS}/${settings?.currentAccountUid}${route}`
        } else {
            return `${DatabaseRoutes.PUBLIC_ACCOUNTS}/${settings?.currentAccountUid}${route}`
        }
    }

    const value = useMemo(() => getAccountRoute, [settings])

    if (!settings || !settings.currentUserUid || !settings.currentAccountUid) return null

    return value
}