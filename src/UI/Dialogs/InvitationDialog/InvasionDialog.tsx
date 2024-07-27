import React, {useEffect, useState} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {useCurrentUser} from "../../../CustomHooks/Database/useCurrentUser";
import {InviteModel} from "../../../Data/DataModels/InviteModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import "./InvasionDialog.scss";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

const InvasionDialog = () => {
    const currentUser = useCurrentUser()
    const translate = useTranslation()

    const [invitesForUser, setInvitesForUser] = useState<InviteModel[] | null>(null)

    useEffect(() => {
        if (!currentUser) return

        getActiveDatabaseHelper().getDBObjectsOnChange(DatabaseRoutes.PUBLIC_ACCOUNT_INVITES, (invites) => {
            setInvitesForUser(
                (Object.values(Object.values(invites)[0] as {}) as []).filter((invite: InviteModel) => {
                    return invite.email === currentUser.email
                })
            )
        })
    }, [currentUser]);
    
    return (
        <DialogOverlay actions={[]}>
            { (currentUser && invitesForUser) ? <>
                { invitesForUser.length > 0 ? invitesForUser.map((invite, index) => (
                    <div key={index} className="invasion-dialog-card">
                        <span className="invasion-dialog-card-text">{translate("invasion-for")} <i>{invite.accountName}</i></span>
                        <button className="invasion-dialog-card-join-button"
                                onClick={() => {
                                    getActiveDatabaseHelper().setDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_USERS}/${invite.accountUid}/${currentUser!.uid}`, invite.accountUid)
                                    getActiveDatabaseHelper().deleteDBObject(`${DatabaseRoutes.PUBLIC_ACCOUNT_INVITES}/${invite.accountUid}`)
                                }}>{translate("join")}</button>
                    </div>
                )) : <span className="no-items">{translate("no-invasions")}</span> }
            </> : <Spinner type={SpinnerType.CYCLE} /> }
        </DialogOverlay>
    );
};

export default InvasionDialog;