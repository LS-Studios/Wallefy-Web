import React, {CSSProperties, useEffect, useState} from 'react';
import InputBaseComponent from "../InputBase/InputBaseComponent";
import './DateInputComponent.scss';
import {MdCalendarMonth, MdCalendarToday, MdDateRange} from "react-icons/md";

import {formatDate, formatDateToStandardString, getMonthAndYear} from "../../../../Helper/DateHelper";
import DropDialog from "../../Dropdialog/DropDialog";
import DatePicker, {DateObject} from "react-multi-date-picker";
import {DayOfWeekModel} from "../../../../Data/DataModels/Reptition/DayOfWeekModel";
import {useScreenScaleStep} from "../../../../CustomHooks/useScreenScaleStep";
import DateCalendar from "./DatePicker/DateCalendar";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import DatePickerDialog from "../../../Dialogs/DatePickerDialog/DatePickerDialog";
import {useSettings} from "../../../../Providers/SettingsProvider";

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
    const dialog = useDialog()
    const screenScaleStep = useScreenScaleStep()
    const settings = useSettings()

    const inputRef = React.createRef<HTMLInputElement>();

    const [showDatePicker, setShowDatePicker] = useState(false);

    const [pickerDate, setPickerDate] = useState<string>(formatDateToStandardString(value));

    const openDatePicker = (e: React.MouseEvent) => {
        e.preventDefault()

        if (screenScaleStep > 0) {
            dialog.open(
                new DialogModel(
                    "Select Date",
                    <DatePickerDialog
                        initDate={value}
                        onDateChange={onValueChange}
                        minDate={minDate}
                        maxDate={maxDate}
                        disabledWeekDays={disabledWeekDays}
                        onlyMonthPicker={onlyMonthPicker}
                    />,
                    325
                )
            )
        } else {
            setShowDatePicker(!showDatePicker);
        }
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
        type="text"
        value={onlyMonthPicker ? getMonthAndYear(new Date(pickerDate), settings?.language || "DE") : formatDate(new Date(pickerDate), settings?.language || "DE")}
        onChange={onInputDateChange}
        readOnly
        onClick={(e) => !title && openDatePicker(e)}
        onBlur={() => inputRef.current?.blur()}
        onKeyDown={onKeyDown}
    />

    const dateInputContainer = title ? <div className="date-input-component-input-container text">
        { dateInput }
        { onlyMonthPicker ? <MdCalendarMonth/> : <MdCalendarToday/> }
    </div> : dateInput;

    return screenScaleStep > 0 ? <>
        {title ? <InputBaseComponent title={title} onClick={openDatePicker}>
            { dateInputContainer }
        </InputBaseComponent> : dateInputContainer}
    </> : (
        <DropDialog
            isOpen={showDatePicker}
            setIsOpen={setShowDatePicker}
            content={
                <DateCalendar
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