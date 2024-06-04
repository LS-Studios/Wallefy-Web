import React, {CSSProperties} from 'react';
import {Calendar, DateObject} from "react-multi-date-picker"

import './DatePicker.scss';
import {DayOfWeekModel} from "../../../../../Data/Transactions/DayOfWeekModel";

const DatePicker = ({
    date,
    setDate,
    minDate,
    maxDate,
    disabledWeekDays,
}: {
    date: Date,
    setDate: (date: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
    disabledWeekDays?: DayOfWeekModel[] | undefined
}) => {
    return (
        <Calendar
            weekDays={[
                "So",
                "Mo",
                "Di",
                "Mi",
                "Do",
                "Fr",
                "Sa",
            ]}
            months={[
                "Januar",
                "Februar",
                "März",
                "April",
                "Mai",
                "Juni",
                "Juli",
                "August",
                "September",
                "Oktober",
                "November",
                "Dezember"
            ]}
            value={date}
            onChange={(dateObj: DateObject) => {
                const date = new Date(dateObj.year, dateObj.month.number - 1, dateObj.day)
                setDate(date)

            }}
            className="date-picker"
            maxDate={maxDate}
            minDate={minDate}
            mapDays={(value) => {
                const date = new Date(value.date.year, value.date.month.number - 1, value.date.day)

                return {
                    disabled: disabledWeekDays?.includes(date.getDay() as DayOfWeekModel) || false
                }
            }}
        />
    );
};

export default DatePicker;