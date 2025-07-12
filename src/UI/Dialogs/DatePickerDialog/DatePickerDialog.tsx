import React from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DateCalendar from "../../Components/Input/DateInputComponent/DatePicker/DateCalendar";
import {useDialog} from "../../../Providers/DialogProvider";
import {DateObject} from "react-multi-date-picker";
import './DatePickerDialog.scss';

const DatePickerDialog = ({
    initDate,
    onDateChange,
    minDate,
    maxDate,
    disabledWeekDays,
    onlyMonthPicker
}: {
    initDate: Date,
    onDateChange: (date: Date) => void,
    minDate?: string | number | Date | DateObject | undefined,
    maxDate?: string | number | Date | DateObject | undefined,
    disabledWeekDays?: any,
    onlyMonthPicker?: boolean
}) => {
    const dialog = useDialog()

    const [date, setDate] = React.useState(initDate)

    return (
        <DialogOverlay actions={[
            new ContentAction(
                "Ok",
                () => {
                    dialog.closeCurrent()
                    onDateChange(date)
                }
            ),
            new ContentAction(
                "Cancel",
                () => {
                    dialog.closeCurrent()
                }
            )
        ]}>
            <div className="date-picker-dialog">
                <DateCalendar
                    date={date}
                    setDate={setDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    disabledWeekDays={disabledWeekDays}
                    onlyMonthPicker={onlyMonthPicker} />
            </div>
        </DialogOverlay>
    );
};

export default DatePickerDialog;