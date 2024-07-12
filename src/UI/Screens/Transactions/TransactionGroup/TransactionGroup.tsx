import React from 'react';
import {TransactionGroupModel} from "../../../../Data/DataModels/TransactionGroupModel";
import Transaction from "../Transaction/Transaction";
import './TransactionGroup.scss';
import {formatDate, getMonthName, speakableDate} from "../../../../Helper/DateHelper";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {CategoryModel} from "../../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../../Data/DatabaseModels/LabelModel";
import {SettingsModel} from "../../../../Data/DataModels/SettingsModel";

const TransactionGroup = ({
    transactionGroup,
    transactionPartners,
    settings,
    translate
}: {
    transactionGroup: TransactionGroupModel,
    transactionPartners: TransactionPartnerModel[] | null,
    settings: SettingsModel | null,
    translate: (string: string) => string
}) => {
    const transactionGroupDate = new Date(transactionGroup.date)

    return (
        <div className="transaction-group">
            { (transactionGroup.isStartOfMonth || isNaN(transactionGroupDate.getTime())) &&
                <span className="transaction-group-start-of-month">{isNaN(transactionGroupDate.getTime()) ? transactionGroup.date : getMonthName(transactionGroupDate, 'de')}</span>
            }
            { !isNaN(transactionGroupDate.getTime()) && <span className="transaction-group-date">{speakableDate(new Date(transactionGroup.date), settings?.language || "de", translate)}</span> }
            <div className="transaction-group-transactions">
                { transactionGroup.transactions.map((transaction, index) => (
                    <Transaction
                        key={index}
                        transaction={transaction}
                        transactionPartners={transactionPartners}
                        isStart={index === 0}
                        isEnd={index === transactionGroup.transactions.length - 1 || transactionGroup.transactions.length === 1}
                        translate={translate}
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionGroup;