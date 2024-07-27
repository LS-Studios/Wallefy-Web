import React from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import './DecisionDialog.scss';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";

const DecisionDialog = ({
    text,
    onYesClick,
}: {
    text: string,
    onYesClick: () => void,
}) => {
    const dialog = useDialog();

    return (
        <DialogOverlay actions={[
            new ContentAction(
                "Yes",
                () => {
                    onYesClick()
                    dialog.closeCurrent()
                }
            ),
            new ContentAction(
                "No",
                () => dialog.closeCurrent()
            )
        ]}>
            <div className="decision-dialog">
                <div>{text}</div>
            </div>
        </DialogOverlay>
    );
}

export default DecisionDialog;