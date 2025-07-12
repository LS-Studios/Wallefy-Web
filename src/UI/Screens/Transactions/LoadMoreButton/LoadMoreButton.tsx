import React from 'react';
import './LoadMoreButton.scss';
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";

const LoadMoreButton = ({
    onClick,
    isLoading
}: {
    onClick: () => void,
    isLoading: boolean
}) => {
    return (
        <button
            className="load-more-button"
            onClick={onClick}
        >
            { isLoading ? <Spinner type={SpinnerType.DOTS} center={true} /> : "Weitere Transaktionen laden" }
        </button>
    );
};

export default LoadMoreButton;