import React, {useEffect, useState} from 'react';
import {MdAdd, MdInbox, MdOutlineAccountCircle, MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import AccountsScreen from "./AccountsScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import CreateAccountDialog from "../../Dialogs/CreateAccountDialog/CreateAccountDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import FilterTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/FilterTransactionsDialog";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import InvasionDialog from "../../Dialogs/InvitationDialog/InvasionDialog";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InviteModel} from "../../../Data/DataModels/InviteModel";
import {useCurrentUser} from "../../../CustomHooks/Database/useCurrentUser";

const AccountsOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog()
    const currentUser = useCurrentUser()

    const [filterValue, setFilterValue] = useState<FilterModel>(new FilterModel())

    const [invitesForUser, setInvitesForUser] = useState<InviteModel[] | null>(null)

    useEffect(() => {
        if (!currentUser) return

        getActiveDatabaseHelper().getDBObjectsOnChange(DatabaseRoutes.PUBLIC_ACCOUNT_INVITES, (invites) => {
            if (!invites.length) return setInvitesForUser([])

            setInvitesForUser(
                (Object.values(Object.values(invites)[0] as {}) as []).filter((invite: InviteModel) => {
                    return invite.email === currentUser.email
                })
            )
        })
    }, [currentUser])

    return (
        <ContentOverlay
            title={translate("accounts")}
            titleIcon={<MdOutlineAccountCircle />}
            actions={[
                new ContentAction(
                    translate("filter"),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("filter-transactions"),
                                <FilterTransactionsDialog
                                    currentFilter={filterValue}
                                    onFilterChange={setFilterValue}
                                    onlyName={true}
                                />
                            )
                        )
                    },
                    false,
                    false,
                    <MdTune />,
                ),
                new ContentAction(
                    translate("add-account"),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("create-account"),
                                <CreateAccountDialog />,
                            )
                        )
                    },
                    false,
                    false,
                    <MdAdd />,
                )
            ]}
            stickyActions={[
                new ContentAction(
                    `${translate("invites")}${invitesForUser && invitesForUser.length > 0 ? ` (${invitesForUser.length})` : ""}`,
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("invites"),
                                <InvasionDialog />
                            )
                        )
                    },
                    false,
                    false,
                    <MdInbox />,
                ),
            ]}
        >
            <AccountsScreen searchValue={filterValue.searchName || ""} />
        </ContentOverlay>
    );
};

export default AccountsOverlay;