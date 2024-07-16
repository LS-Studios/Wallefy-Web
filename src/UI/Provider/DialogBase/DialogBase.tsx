import "./DialogBase.scss"

import React, {useRef} from 'react';
import {PropsWithChildren} from "react";
import {MdClose} from "react-icons/md";
import Divider from "../../Components/Divider/Divider";
import {useClickAway} from "@uidotdev/usehooks";
import {ContextMenuModel} from "../../../Data/DataModels/ContextMenuModel";

const DialogBase = ({
    title,
    width = 400,
    onClose,
    children
}: PropsWithChildren<{
    title: string,
    width: number,
    onClose: () => void
}>) => {
    return (
        <div id="popup" className="overlay">
            <div className="popup">
                <div className="content" style={{width}}>
                    <div className="header">
                        <h3>{title}</h3>
                        <MdClose className="closeIcon" onClick={onClose}/>
                    </div>
                    <Divider />
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DialogBase;