import React, {CSSProperties} from 'react';

import './CheckboxInputComponent.scss';
import {MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineCheckBox} from "react-icons/md";

const CheckboxInputComponent = ({
    text,
    value,
    onValueChange,
    style,
}: {
    text: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    style?: CSSProperties,
}) => {
    return (
        <div
            style={style}
            className="checkbox-input-component"
            onClick={() => onValueChange(!value)}
        >
            <label>{text}</label>
            {
                value ? <MdOutlineCheckBox /> : <MdCheckBoxOutlineBlank />
            }
        </div>
    );
};

export default CheckboxInputComponent;