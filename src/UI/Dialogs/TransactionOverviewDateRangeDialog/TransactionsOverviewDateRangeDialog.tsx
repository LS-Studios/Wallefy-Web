import React, {useEffect} from 'react';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DialogOverlay from "../DialogOverlay/DialogOverlay";

import './TransactionsOverviewDateRangeDialog.scss';
import {useDialog} from "../../../Providers/DialogProvider";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {TransactionType} from "../../../Data/EnumTypes/TransactionType";
import InputBaseComponent from "../../Components/Input/InputBase/InputBaseComponent";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import DateInputComponent from "../../Components/Input/DateInputComponent/DateInputComponent";
import {dateRangeIsMonth, formatDateToStandardString, getEndOfMonth, getStartOfMonth} from "../../../Helper/DateHelper";
import {DateRangeType} from "../../../Data/EnumTypes/DateRangeType";
import {useTranslation} from "../../../CustomHooks/useTranslation";

const TransactionsOverviewDateRangeDialog = ({
    currentDateRange,
    onDateRangeChange,
}: {
    currentDateRange: DateRangeModel;
    onDateRangeChange: (dateRange: DateRangeModel) => void;
}) => {
    const translate = useTranslation();
    const dialog = useDialog();

    const dateRangeTypeInputOptions = [
        new InputOptionModel(translate("month"), DateRangeType.MONTH),
        new InputOptionModel(translate("date-range"), DateRangeType.DATE_RANGE)
    ];

    const [dateRangeType, setDateRangeType] = React.useState<DateRangeType>(DateRangeType.DATE_RANGE);
    const [overviewDateRange, setOverviewDateRange] = React.useState<DateRangeModel>(structuredClone(currentDateRange));

    useEffect(() => {
        setOverviewDateRange(structuredClone(currentDateRange))

        if (dateRangeIsMonth(currentDateRange)) {
            setDateRangeType(DateRangeType.MONTH);
        }
    }, []);

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("apply"),
                () => {
                    onDateRangeChange(overviewDateRange);
                    dialog.closeCurrent();
                }
            ),
        ]}>
            <RadioInputComponent
                value={dateRangeTypeInputOptions.find(option => option.value === dateRangeType) || dateRangeTypeInputOptions[0]}
                onValueChange={(value) => {
                    setDateRangeType((value as InputOptionModel<DateRangeType>).value);
                }}
                options={dateRangeTypeInputOptions}
            />
            { dateRangeType === DateRangeType.MONTH ? <>
                <DateInputComponent
                    title={translate("month")}
                    value={new Date(overviewDateRange.startDate)}
                    onValueChange={(value) => {
                        setOverviewDateRange(new DateRangeModel(formatDateToStandardString(getStartOfMonth(value)), formatDateToStandardString(getEndOfMonth(value))));
                    }}
                    onlyMonthPicker={true}
                />
            </> : <>
                <InputBaseComponent
                    title={translate("date-range")}
                >
                    <div className="filter-transaction-dialog-date-range">
                        <DateInputComponent
                            value={new Date(overviewDateRange.startDate)}
                            onValueChange={(value) => {
                                setOverviewDateRange((oldDateRange) => {
                                    return new DateRangeModel(formatDateToStandardString(value), oldDateRange.endDate);
                                });
                            }}
                        />
                        <span>to</span>
                        <DateInputComponent
                            value={new Date(overviewDateRange.endDate)}
                            onValueChange={(value) => {
                                setOverviewDateRange((oldDateRange) => {
                                    return new DateRangeModel(oldDateRange.startDate, formatDateToStandardString(value));
                                });
                            }}
                        />
                    </div>
                </InputBaseComponent>
            </> }
        </DialogOverlay>
    );
};

export default TransactionsOverviewDateRangeDialog;