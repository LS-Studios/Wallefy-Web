import React, {CSSProperties} from 'react';

import './CheckboxInputComponent.scss';
import {MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineCheckBox} from "react-icons/md";

const CheckboxInputComponent = ({
    text,
    value,
    onValueChange,
    disabled,
    style,
}: {
    text: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    disabled?: boolean,
    style?: CSSProperties,
}) => {
    return (
        <div
            style={style}
            className={"checkbox-input-component " + (disabled ? "disabled" : "")}
            onClick={() => !disabled && onValueChange(!value)}
        >
            <label>{text}</label>
            {
                value ? <MdOutlineCheckBox /> : <MdCheckBoxOutlineBlank />
            }
        </div>
    );
};

export default CheckboxInputComponent;