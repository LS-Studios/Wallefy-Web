import React, {PropsWithChildren} from 'react'
import {ContentAction} from "../../../Data/ContentAction/ContentAction";

import "./DialogOverlay.scss"
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

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
                        return action.loading ? <Spinner type={SpinnerType.CYCLE} /> : (
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