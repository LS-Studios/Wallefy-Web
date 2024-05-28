import React, {PropsWithChildren} from 'react'
import {ContentAction} from "../../../Data/ContentAction/ContentAction";

import "./DialogOverlay.scss"

const DialogOverlay = ({
    actions,
    children,
}: PropsWithChildren<{
    actions: ContentAction[],
}>) => {
    return (
        <div className="dialog-overlay">
            {children}
            { actions.length > 0 && <div className="dialog-overlay-action-buttons">
                    { actions.map((action, index) => {
                        return (
                            <button key={index} onClick={action.action} disabled={action.disabled}>
                                {action.name}
                            </button>
                        )
                    }) }
                </div>
            }
        </div>
    );
};

export default DialogOverlay;