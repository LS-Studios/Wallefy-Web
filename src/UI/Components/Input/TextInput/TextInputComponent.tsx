import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './TextInputComponent.scss';

const TextInputComponent = ({
    title,
    value,
    onValueChange,
    placeholder,
    onFocus,
    onBlur,
    type = "text",
    style,
}: {
    title?: string,
    value: string | number | null,
    onValueChange?: (value: string | number | null) => void,
    placeholder?: string,
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void,
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void,
    type?: string,
    style?: CSSProperties,
}) => {
    const inputRef = React.createRef<HTMLInputElement>();

    const [inputIsExpanded, setInputIsExpanded] = useState<boolean>(false);

    const [inputValue, setInputValue] = useState<string>("");

    const changeFocus = (newFocusValue: boolean) => {
        if (!setInputIsExpanded) return;

        if (newFocusValue) {
            setInputIsExpanded(true)
            inputRef.current?.focus();
        } else if (!value) {
            setInputIsExpanded(false)
            inputRef.current?.blur();
        }
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onValueChange) return

        if (e.key === "Enter") {
            changeFocus(false);
            inputRef.current?.blur();
        }

        if (type === "number") {
            if (e.key === "ArrowUp") {
                if (!inputValue) {
                    setInputValue("1");
                    onValueChange(1);
                } else {
                    const newValue = Number(inputValue) + 1;
                    setInputValue(newValue.toString());
                    onValueChange(newValue);
                }
            } else if (e.key === "ArrowDown") {
                if (!inputValue) {
                    setInputValue("0");
                    onValueChange(0);
                } else {
                    const newValue = Number(inputValue) - 1;

                    if (newValue > 0) {
                        setInputValue(newValue.toString());
                        onValueChange(newValue);
                    }
                }
            }
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onValueChange) return

        const newInputValue = e.target.value;

        if (type === "number") {
            if (/^(|[1-9]\d*)$/.test(newInputValue)) {
                setInputValue(newInputValue)
                onValueChange(newInputValue ? Number(e.target.value) : null);
            } else {
                onValueChange(null);
            }
        } else {
            setInputValue(newInputValue)
            onValueChange(newInputValue);
        }
    }

    const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (onFocus) {
            onFocus(e);
        }
        changeFocus(true);
    }

    const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (onBlur) {
            onBlur(e);
        }
        changeFocus(false);
    }

    useEffect(() => {
        setInputValue(value ? value.toString() : "");
        if (value) {
            setInputIsExpanded(true);
        }
    }, [value]);

    const inputComponent = <input
        className="text-input-component-input"
        style={{
            height: title ? (inputIsExpanded || placeholder ? "26px" : "0") : "26px",
        }}
        ref={inputRef}
        value={inputValue}
        type={type !== "number" ? type : "text"}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        disabled={!onValueChange}
    />

    return title ? <InputBaseComponent
        title={title}
        style={{
            ...style,
            cursor: onValueChange ? "pointer" : "default"
        }}
        onClick={() => changeFocus(true)}
        labelClassName={inputIsExpanded || placeholder ? "input-is-expanded" : ""}
    >
        { inputComponent }
    </InputBaseComponent> : inputComponent
};

export default TextInputComponent;