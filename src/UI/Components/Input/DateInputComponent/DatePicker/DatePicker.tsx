import React from 'react';
import {Calendar, DateObject} from "react-multi-date-picker"

import './DatePicker.scss';
import {DayOfWeekModel} from "../../../../../Data/DataModels/Reptition/DayOfWeekModel";
import {getWeekDayNameShort} from "../../../../../Helper/DateHelper";
import {useTranslation} from "../../../../../CustomHooks/useTranslation";
import {useSettings} from "../../../../../Providers/SettingsProvider";

const DatePicker = ({
    date,
    setDate,
    minDate,
    maxDate,
    disabledWeekDays,
    onlyMonthPicker
}: {
    date: Date,
    setDate: (date: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
    disabledWeekDays?: DayOfWeekModel[] | undefined,
    onlyMonthPicker?: boolean
}) => {
    const settings = useSettings()
    const translate = useTranslation()

    return (
        <Calendar
            weekDays={[
                getWeekDayNameShort(0, settings?.language || 'de-DE'),
                getWeekDayNameShort(1, settings?.language || 'de-DE'),
                getWeekDayNameShort(2, settings?.language || 'de-DE'),
                getWeekDayNameShort(3, settings?.language || 'de-DE'),
                getWeekDayNameShort(4, settings?.language || 'de-DE'),
                getWeekDayNameShort(5, settings?.language || 'de-DE'),
                getWeekDayNameShort(6, settings?.language || 'de-DE')
            ]}
            months={[
                translate("january"),
                translate("february"),
                translate("march"),
                translate("april"),
                translate("may"),
                translate("june"),
                translate("july"),
                translate("august"),
                translate("september"),
                translate("october"),
                translate("november"),
                translate("december")
            ]}
            value={date}
            onChange={(dateObj: DateObject) => {
                const date = new Date(dateObj.year, dateObj.month.number - 1, dateObj.day)
                setDate(date)

            }}
            className="date-picker"
            onlyMonthPicker={onlyMonthPicker}
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