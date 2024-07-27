import React, {useEffect} from 'react';
import {Navigate, useNavigate, useParams} from "react-router-dom";
import {RoutePath} from "../../../Data/EnumTypes/RoutePath";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import DecisionDialog from "../../Dialogs/DecisionDialog/DecisionDialog";
import {LinkInvite} from "../../../Data/DataModels/LinkInvite";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {useCurrentUser} from "../../../CustomHooks/Database/useCurrentUser";

const InvitationsScreen = () => {
    const dialog = useDialog()
    const translate = useTranslation()

    const currentUser = useCurrentUser()

    let { inviteUrl } = useParams();

    const [isLoading, setIsLoading] = React.useState<boolean>(true)

    useEffect(() => {
        if (!inviteUrl || !currentUser) return

        getActiveDatabaseHelper().getDBLinkInvite(inviteUrl).then((linkInvite) => {
            if (linkInvite) {
                getActiveDatabaseHelper().getDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${linkInvite.accountUid}/${currentUser.uid}`).then((user) => {
                    if (user !== null) return setIsLoading(false)

                    if (linkInvite) {
                        dialog.open(
                            new DialogModel(
                                translate("account-invitation"),
                                <DecisionDialog
                                    text={translate("do-you-want-to-join-account", linkInvite.accountName)}
                                    onYesClick={() => {
                                        getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${linkInvite.accountUid}/${currentUser.uid}`, linkInvite.accountUid)
                                    }}
                                />
                            )
                        )
                    }

                    setIsLoading(false)
                })
            }
        })
    }, [inviteUrl, currentUser]);

    if (isLoading) return <Spinner type={SpinnerType.CYCLE} style={{height:"100vh"}} />
    else return <Navigate to={RoutePath.HOME} />
};

export default InvitationsScreen;