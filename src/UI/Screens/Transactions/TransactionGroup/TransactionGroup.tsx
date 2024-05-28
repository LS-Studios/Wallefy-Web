import React from 'react';
import {TransactionGroupModel} from "../../../../Data/Transactions/TransactionGroupModel";
import Transaction from "../Transaction/Transaction";
import './TransactionGroup.scss';
import {formatDate, getDateFromStandardString, getMonthName, speakableDate} from "../../../../Helper/DateHelper";
import {TransactionPartnerModel} from "../../../../Data/TransactionPartnerModel";
import {CategoryModel} from "../../../../Data/CategoryModel";
import {LabelModel} from "../../../../Data/LabelModel";

const TransactionGroup = ({
    transactionGroup,
    transactionPartners,
}: {
    transactionGroup: TransactionGroupModel,
    transactionPartners: TransactionPartnerModel[] | null,
}) => {
    return (
        <div className="transaction-group">
            { transactionGroup.isStartOfMonth &&
                <span className="transaction-group-start-of-month">{getMonthName(getDateFromStandardString(transactionGroup.date), 'de')}</span>
            }
            <span className="transaction-group-date">{speakableDate(getDateFromStandardString(transactionGroup.date))}</span>
            <div className="transaction-group-transactions">
                { transactionGroup.transactions.map((transaction, index) => (
                    <Transaction
                        key={index}
                        transaction={transaction}
                        transactionPartners={transactionPartners}
                    />
                ))}
            </div>
        </div>
    );
};

export default TransactionGroup;