import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './CurrencyInputComponent.scss';
import CurrencyInput from "../../CustomCurrrencyInput/CurrencyInput";
import {formatValue} from "../../CustomCurrrencyInput/utils";

const CurrencyInputComponent = ({
    title,
    value,
    onValueChange,
    style,
}: {
    title?: string,
    value: number | undefined | null,
    onValueChange: (value: number) => void,
    style?: CSSProperties,
}) => {
    const inputRef = React.createRef<HTMLInputElement>();

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            inputRef.current?.blur();
        }
    }

    const currencyInput = <div className={"currency-input-component " + (title ? "" : "box") }>
        <CurrencyInput
            ref={inputRef}
            className={title ? "currency-input-component-input-text" : "currency-input-component-input-box"}
            value={value || undefined}
            onValueChange={(value, name, values) => {
                onValueChange(values?.float!)
            }}
            placeholder="0,00"
            decimalsLimit={2}
            decimalScale={2}
            fixedDecimalLength={2}
            allowNegativeValue={false}
            onKeyDown={onKeyDown}
        />
        <span>EUR</span>
    </div>

    return title ? <InputBaseComponent
            title={title}
            style={style}
            onClick={() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }}
        >
            { currencyInput }
        </InputBaseComponent> : currencyInput
};

export default CurrencyInputComponent;