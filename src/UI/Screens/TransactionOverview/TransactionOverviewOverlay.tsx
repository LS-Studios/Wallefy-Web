import React from 'react';
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {MdDateRange, MdOutlineBarChart} from "react-icons/md";
import TransactionOverviewScreen from "./TransactionOverviewScreen";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import TransactionsOverviewDateRangeDialog
    from "../../Dialogs/TransactionOverviewDateRangeDialog/TransactionsOverviewDateRangeDialog";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import {
    formatDateToStandardString,
    getEndOfMonth,
    getStartOfMonth,
    speakableDateRange
} from "../../../Helper/DateHelper";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";

const TransactionOverviewOverlay = () => {
    const translate = useTranslation();
    const dialog = useDialog();
    const settings = useSettings()

    const [dateRange, setDateRange] = React.useState<DateRangeModel>(new DateRangeModel(
        formatDateToStandardString(getStartOfMonth(new Date())),
        formatDateToStandardString(getEndOfMonth(new Date()))
    ));

    return (
        <ContentOverlay
            title={translate("transaction-overview")}
            titleIcon={<MdOutlineBarChart />}
            actions={[
                new ContentAction(
                    translate("date-range") + " ( " + speakableDateRange(dateRange, settings?.language || "DE") + " )",
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("select-date-range"),
                                <TransactionsOverviewDateRangeDialog
                                    currentDateRange={dateRange}
                                    onDateRangeChange={(dateRange) => {
                                        setDateRange(dateRange);
                                    }}
                                />
                            )
                        );
                    },
                    false,
                    false,
                    <MdDateRange />
                )
            ]}
        >
            <TransactionOverviewScreen
                dateRange={dateRange}
            />
        </ContentOverlay>
    );
};

export default TransactionOverviewOverlay;