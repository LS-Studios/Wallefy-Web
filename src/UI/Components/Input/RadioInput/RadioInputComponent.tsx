import React from 'react';
import './RadioInputComponent.scss';
import {InputOptionModel} from "../../../../Data/Input/InputOptionModel";
import InputBaseComponent from "../InputBase/InputBaseComponent";

const RadioInputComponent = ({
    title,
    value,
    onValueChange,
    options,
}: {
    title?: string,
    value: InputOptionModel<any> | InputOptionModel<any>[],
    onValueChange: (value: InputOptionModel<any> | InputOptionModel<any>[]) => void,
    options: InputOptionModel<any>[]
}) => {
    const radioInput = <div className="radio-input-component">
        {options.map((option, index) => {
            return <button
                key={index}
                className={(Array.isArray(value) ? value.find((value) => value.value === option.value) : value.value === option.value) ? "selected" : ""}
                value={option.value}
                onClick={() => {
                    if (Array.isArray(value)) {
                        if (value.find((value) => value.value === option.value)) {
                            onValueChange(value.filter((value) => value.value !== option.value));
                        } else {
                            onValueChange([...value, option]);
                        }
                    } else {
                        onValueChange(option);
                    }
                }}
            >{
                option.name
            }</button>
        })}
    </div>

    return title ? <InputBaseComponent title={title}>
                { radioInput }
            </InputBaseComponent> : radioInput
};

export default RadioInputComponent;