import {useEffect, useState} from "react";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "./useAccountRoute";
import {DebtModel} from "../../Data/DatabaseModels/DebtModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";
import {TransactionPartnerModel} from "../../Data/DatabaseModels/TransactionPartnerModel";
import {UserDataModel} from "../../Data/DatabaseModels/UserDataModel";
import {useSettings} from "../../Providers/SettingsProvider";
import {InviteModel} from "../../Data/DataModels/InviteModel";

export const useInvites = (accountUid: string) => {
    const settings = useSettings()

    const [invites, setInvites] = useState<string[] | null>(null);

    useEffect(() => {
        if (!settings || !accountUid) return

        getActiveDatabaseHelper().getDBObjectOnChange(
            `${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${accountUid}`,
            (invites) => {
                if (!invites) return setInvites([])
                setInvites((Object.values(invites).map(invite => (invite as InviteModel).email)))
            }
        )
    }, [settings, accountUid]);

    return invites
}