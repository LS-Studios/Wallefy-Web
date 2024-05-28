import React, {CSSProperties} from 'react';
import {Calendar, DateObject} from "react-multi-date-picker"

import './DatePicker.scss';

const DatePicker = ({
    date,
    setDate,
    minDate,
    maxDate,
}: {
    date: Date,
    setDate: (date: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
}) => {
    return (
        <Calendar
            weekDays={[
                "Mo",
                "Di",
                "Mi",
                "Do",
                "Fr",
                "Sa",
                "So",
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
        />
    );
};

export default DatePicker;