import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './TextAreaInputComponent.scss';

const TextAreaInputComponent = ({
    title,
    value,
    onValueChange,
    style,
}: {
    title: string,
    value: string,
    onValueChange: (value: string) => void,
    style?: CSSProperties,
}) => {
    const textareaRef = React.createRef<HTMLTextAreaElement>();

    const [inputIsExpanded, setInputIsExpanded] = useState<Boolean>(false)

    const changeFocus = (newFocusValue: boolean) => {
        if (newFocusValue) {
            setInputIsExpanded(true)
            textareaRef.current?.focus();

            textareaRef.current!.style.height = calculateTextAreaHeight(value, true)
        } else if (!value) {
            setInputIsExpanded(false)
            textareaRef.current?.blur();
            textareaRef.current!.style.height = "0";
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onValueChange(e.target.value)
    }

    const calculateTextAreaHeight = (text: string, inputIsExpanded: boolean) => {
        if (!inputIsExpanded) {
            return "0"
        }

        const maxCharsPerLine = 36;

        const lines = text.split('\n');

        let lineCount = 0;
        for (const line of lines) {
            if (line.length === 0) {
                lineCount++;
            } else {
                lineCount += Math.ceil(line.length / maxCharsPerLine);
            }
        }

        return 26 + (24 * (lineCount - 1)) +"px"
    }

    useEffect(() => {
        if (value) {
            setInputIsExpanded(true)
            textareaRef.current!.style.height = calculateTextAreaHeight(value, true)
        } else if (inputIsExpanded) {
            textareaRef.current!.style.height = calculateTextAreaHeight(value, true)
        }
    }, [value]);

    return (
        <InputBaseComponent
            title={title}
            style={style}
            onClick={() => changeFocus(true)}
            labelClassName={inputIsExpanded ? "input-is-expanded" : ""}
        >
            <textarea
                className="text-area-input-component-input"
                ref={textareaRef}
                value={value}
                onChange={onChange}
                onFocus={() => changeFocus(true)}
                onBlur={() => changeFocus(false)}
            />
        </InputBaseComponent>
    );
};

export default TextAreaInputComponent;