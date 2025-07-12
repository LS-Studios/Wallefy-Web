import React from 'react';
import "./ButtonInputComponent.scss";
import Spinner from "../../Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";

const ButtonInputComponent = ({
    text,
    onClick,
    isLoading = false
}: {
    text: string,
    onClick: () => void,
    isLoading?: boolean
}) => {
    return (
        <button className="button-input" onClick={() => {
            !isLoading && onClick()
        }}>
            { isLoading ? <Spinner type={SpinnerType.DOTS} center={true} /> : text }
        </button>
    );
};

export default ButtonInputComponent;