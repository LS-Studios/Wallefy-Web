import React from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

const LoadingDialog = () => {
    return (
        <DialogOverlay actions={[]}>
            <Spinner type={SpinnerType.DOTS} center={true} />
        </DialogOverlay>
    );
};

export default LoadingDialog;