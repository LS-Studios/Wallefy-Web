import React from 'react';
import "../../Transactions/TransactionGroup/TransactionGroup.scss"
import {formatDate, getMonthName, speakableDate} from "../../../../Helper/DateHelper";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {SettingsModel} from "../../../../Data/DataModels/SettingsModel";
import {DebtGroupModel} from "../../../../Data/DataModels/DebtGroupModel";
import Debt from "../Debt/Debt";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {useTranslation} from "../../../../CustomHooks/useTranslation";

const DebtGroup = ({
    debtGroup,
    transactionPartners,
    backgroundColor = "var(--background)"
}: {
    debtGroup: DebtGroupModel,
    transactionPartners: TransactionPartnerModel[] | null,
    backgroundColor?: string
}) => {
    const settings = useSettings()
    const translate = useTranslation()

    const transactionGroupDate = new Date(debtGroup.date)

    return (
        <div className="transaction-group">
            { (debtGroup.isStartOfMonth || isNaN(transactionGroupDate.getTime())) &&
                <span className="transaction-group-start-of-month">{isNaN(transactionGroupDate.getTime()) ? debtGroup.date : getMonthName(transactionGroupDate, 'de')}</span>
            }
            { !isNaN(transactionGroupDate.getTime()) && <span className="transaction-group-date">{speakableDate(new Date(debtGroup.date), settings?.language || "de", translate)}</span> }
            <div className="transaction-group-transactions">
                { debtGroup.debts.map((debt, index) => (
                    <Debt
                        key={index}
                        debt={debt}
                        transactionPartners={transactionPartners}
                        isStart={index === 0}
                        isEnd={index === debtGroup.debts.length - 1 || debtGroup.debts.length === 1}
                        translate={translate}
                        backgroundColor={backgroundColor}
                    />
                ))}
            </div>
        </div>
    );
};

export default DebtGroup;