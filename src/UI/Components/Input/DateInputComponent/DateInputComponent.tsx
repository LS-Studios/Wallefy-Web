import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './DateInputComponent.scss';
import {MdDateRange} from "react-icons/md";
import DatePicker from "./DatePicker/DatePicker";
import {formatDate, formatDateToStandardString, getDateFromStandardString} from "../../../../Helper/DateHelper";
import DropDialog from "../../Dropdialog/DropDialog";
import {DateObject} from "react-multi-date-picker";
import {DayOfWeekModel} from "../../../../Data/Transactions/DayOfWeekModel";

const DateInputComponent = ({
    title,
    value,
    onValueChange,
    minDate,
    maxDate,
    disabledWeekDays
}: {
    title?: string,
    value: Date,
    onValueChange: (value: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
    disabledWeekDays?: DayOfWeekModel[] | undefined
}) => {
    const inputRef = React.createRef<HTMLInputElement>();

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [pickerDate, setPickerDate] = useState<string>(formatDateToStandardString(value));

    const openDatePicker = (e: React.MouseEvent) => {
        e.preventDefault()

        setShowDatePicker(!showDatePicker);
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            setShowDatePicker(false);
            inputRef.current?.blur();
        }
    }

    const onDatePickerDateChange = (date: Date) => {
        setPickerDate(formatDateToStandardString(date));
        setShowDatePicker(false);
    }

    const onInputDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPickerDate(e.target.value)
        setShowDatePicker(false);
    }

    useEffect(() => {
        setPickerDate(formatDateToStandardString(value));
    }, [value]);

    useEffect(() => {
        onValueChange(getDateFromStandardString(pickerDate));
    }, [pickerDate]);

    const dateInput = <input
        ref={inputRef}
        className={"date-input-component-input " + (title ? "text" : "box") }
        onClick={openDatePicker}
        type="date"
        spellCheck="false"
        autoComplete="false"
        value={pickerDate}
        onChange={onInputDateChange}
        onBlur={() =>inputRef.current?.blur()}
        onKeyDown={onKeyDown}
    />

    return (
        <DropDialog
            isOpen={showDatePicker}
            setIsOpen={setShowDatePicker}
            content={
                <DatePicker
                    date={value}
                    setDate={onDatePickerDateChange}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabledWeekDays={disabledWeekDays}
                />
            }
        >
            { title ? <InputBaseComponent title={title}>
                { dateInput }
            </InputBaseComponent> : dateInput }
        </DropDialog>
    );
};

export default DateInputComponent;