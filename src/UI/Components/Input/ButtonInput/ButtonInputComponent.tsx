import React from 'react';
import "./ButtonInputComponent.scss";

const ButtonInputComponent = ({
    text,
    onClick,
}: {
    text: string,
    onClick: () => void,
}) => {
    return (
        <button className="button-input" onClick={onClick}>
            {text}
        </button>
    );
};

export default ButtonInputComponent;