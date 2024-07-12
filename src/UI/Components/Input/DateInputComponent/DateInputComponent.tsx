import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './DateInputComponent.scss';
import {MdCalendarMonth, MdDateRange} from "react-icons/md";
import DatePicker from "./DatePicker/DatePicker";
import {formatDate, formatDateToStandardString, getMonthAndYear} from "../../../../Helper/DateHelper";
import DropDialog from "../../Dropdialog/DropDialog";
import {DateObject} from "react-multi-date-picker";
import {DayOfWeekModel} from "../../../../Data/DataModels/Reptition/DayOfWeekModel";

const DateInputComponent = ({
    title,
    value,
    onValueChange,
    minDate,
    maxDate,
    disabledWeekDays,
    onlyMonthPicker
}: {
    title?: string,
    value: Date,
    onValueChange: (value: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
    disabledWeekDays?: DayOfWeekModel[] | undefined,
    onlyMonthPicker?: boolean
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
        onValueChange(new Date(pickerDate));
    }, [pickerDate]);

    const dateInput = <input
        ref={inputRef}
        className={"date-input-component-input " + (title ? "text" : "box")}
        onClick={openDatePicker}
        type={onlyMonthPicker ? "text" : "date"}
        spellCheck="false"
        autoComplete="false"
        value={onlyMonthPicker ? getMonthAndYear(new Date(pickerDate), "DE") : pickerDate}
        onChange={onInputDateChange}
        onBlur={() => inputRef.current?.blur()}
        onKeyDown={onKeyDown}
    />

    const dateInputContainer = onlyMonthPicker ? <div className={"date-input-component-input-container " + (title ? "text" : "box")}>
        {dateInput}
        <MdCalendarMonth onClick={openDatePicker}/>
    </div> : dateInput

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
                    onlyMonthPicker={onlyMonthPicker}
                />
            }
        >
            {title ? <InputBaseComponent title={title} onClick={openDatePicker}>
                { dateInputContainer }
            </InputBaseComponent> : dateInputContainer}
        </DropDialog>
    );
};

export default DateInputComponent;