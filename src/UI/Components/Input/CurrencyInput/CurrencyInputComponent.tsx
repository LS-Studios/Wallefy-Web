import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './CurrencyInputComponent.scss';
import CurrencyInput from "../../CustomCurrrencyInput/CurrencyInput";
import {formatValue} from "../../CustomCurrrencyInput/utils";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import CurrencyDialog from "../../../Dialogs/CurrencyDialog/CurrencyDialog";
import {CurrencyModel} from "../../../../Data/DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";

const CurrencyInputComponent = ({
    title,
    value,
    onValueChange,
    changeOnBlur = false,
    currency,
    onCurrencyChange,
    currencyRateIsDisabled = false,
    allowNegativeValue = false,
    centerText,
    suffix,
    disabled,
    min,
    max,
    style,
}: {
    title?: string,
    value: number | undefined | null,
    onValueChange?: (value: number) => void,
    changeOnBlur?: boolean,
    currency?: CurrencyModel | null,
    onCurrencyChange?: (value: CurrencyModel) => void,
    currencyRateIsDisabled?: boolean,
    allowNegativeValue?: boolean,
    centerText?: boolean,
    suffix?: string,
    disabled?: boolean,
    min?: number,
    max?: number,
    style?: CSSProperties,
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const dialog = useDialog()

    const inputRef = React.createRef<HTMLInputElement>();

    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [tempValue, setTempValue] = useState<number | null>(null)

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            inputRef.current?.blur();
        }
    }

    const currencyInput = <div className={"currency-input-component " + (disabled ? "disabled " : "") + (title ? "" : "box ") + (isFocused ? "focused" : "") }>
        <CurrencyInput
            ref={inputRef}
            className={title ? "currency-input-component-input-text" : "currency-input-component-input-box"}
            value={value || undefined}
            onValueChange={(value, name, values) => {
                if (changeOnBlur) {
                    setTempValue(values?.float!)
                } else {
                    onValueChange && onValueChange(values?.float!)
                }
            }}
            placeholder="0,00"
            decimalsLimit={2}
            decimalScale={2}
            fixedDecimalLength={2}
            allowNegativeValue={allowNegativeValue}
            onKeyDown={onKeyDown}
            suffix={suffix}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
                setIsFocused(false)
                changeOnBlur && onValueChange && onValueChange(tempValue || 0)
            }}
            centerText={centerText}
            disabled={disabled}
            min={min}
            max={max}
        />
        { currency && <span onClick={() => {
            onCurrencyChange && dialog.open(
                new DialogModel(
                    translate("currency-selection"),
                    <CurrencyDialog
                        value={value}
                        currentCurrency={currency || getDefaultCurrency(currentAccount?.currencyCode)}
                        onCurrencyChange={(newCurrency) => {
                            onCurrencyChange(newCurrency)
                        }}
                        currencyRateIsDisabled={currencyRateIsDisabled}
                    />,
                )
            )
        }}>{currency?.currencyCode}</span> }
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