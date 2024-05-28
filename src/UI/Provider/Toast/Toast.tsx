import React, {PropsWithChildren} from 'react';
import "./Toast.scss";
import {MdClose} from "react-icons/md";
import {useTimeout} from "../../../CustomHooks/useTimeout";

const Toast = ({
    message,
    close
}: {
    message: string,
    close: () => void
}) => {
    useTimeout(close, 5000);

    return (
        <div className="toast">
            <div>{ message }</div>
            <MdClose className="toastClose" onClick={close} />
        </div>
    );
};

export default Toast;