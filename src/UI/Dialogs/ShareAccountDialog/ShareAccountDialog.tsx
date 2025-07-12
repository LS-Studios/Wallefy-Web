import React from 'react';
import AccountsOverlay from "../../Screens/Accounts/AccountsOverlay";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import QRCode from "react-qr-code";
import './ShareAccountDialog.scss';
import {RoutePath} from "../../../Data/EnumTypes/RoutePath";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useToast} from "../../../Providers/Toast/ToastProvider";

const ShareAccountDialog = ({
    linkInviteUid,
}: {
    linkInviteUid: string,
}) => {
    const translate = useTranslation();
    const toast = useToast();

    const link = `${window.location.host}${RoutePath.INVITATIONS}/${linkInviteUid}`;

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("copy-link"),
                () => {
                    toast.open(translate("copied"));
                    navigator.clipboard.writeText(link);
                }
            )
        ]}>
            <QRCode
                value={link}
                className="share-account-dialog-qr-code"
                fgColor="var(--text)"
                bgColor="var(--primary)"
            />
        </DialogOverlay>
    );
};

export default ShareAccountDialog;