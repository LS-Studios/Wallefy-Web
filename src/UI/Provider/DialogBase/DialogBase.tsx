import "./DialogBase.scss"

import React from 'react';
import {PropsWithChildren} from "react";
import {MdClose} from "react-icons/md";
import Divider from "../../Components/Divider/Divider";

const DialogBase = ({
    title,
    width = 400,
    onClose,
    children
}: PropsWithChildren<{
    title: string | null,
    width: number,
    onClose: () => void
}>) => {
    return (
        <div id="popup" className="overlay">
            <div className="popup">
                <div className="content" style={{width}}>
                    { title && <>
                        <div className="header">
                            <h3>{title}</h3>
                            <MdClose className="closeIcon" onClick={onClose}/>
                        </div>
                        <Divider />
                    </> }
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DialogBase;