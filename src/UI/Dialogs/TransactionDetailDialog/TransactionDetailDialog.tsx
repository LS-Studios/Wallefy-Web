import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import {formatDate, getDateFromStandardString, speakableDate} from "../../../Helper/DateHelper";

import './TransactionDetailDialog.scss';
import {TransactionType} from "../../../Data/Transactions/TransactionType";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import Divider from "../../Components/Divider/Divider";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import CreateTransactionDialog from "../CreateTransactionDialog/CreateTransactionDialog";
import {DialogModel} from "../../../Data/Providers/DialogModel";
import {RepetitionHelper} from "../../../Helper/RepetitionHelper";
import {deleteDBItem, getDBItemOnChange, getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {CategoryModel} from "../../../Data/CategoryModel";
import {LabelModel} from "../../../Data/LabelModel";

const TransactionDetailDialog = ({
    transaction,
    preFetchedTransactionPartners
 }: {
    transaction: TransactionModel,
    preFetchedTransactionPartners: TransactionPartnerModel[] | null
}) => {
    const dialog = useDialog()
    const toast = useToast()

    const [detailTransaction, setDetailTransaction] = React.useState<TransactionModel>(transaction)
    const [transactionPartners, setTransactionPartners] = React.useState<TransactionPartnerModel[] | null>(preFetchedTransactionPartners)
    const [categories, setCategories] = React.useState<CategoryModel[] | null>(null)
    const [labels, setLabels] = React.useState<LabelModel[] | null>(null)

    useEffect(() => {
        getDBItemOnChange(DatabaseRoutes.TRANSACTIONS + "/" + transaction.uid, (newTransaction: TransactionModel | null) => {
            setDetailTransaction(newTransaction || transaction)
        })

        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, setTransactionPartners)
        getDBItemsOnChange(DatabaseRoutes.CATEGORIES, setCategories)
        getDBItemsOnChange(DatabaseRoutes.LABELS, setLabels)
    }, []);

    const details = [
        {
            title: "Name",
            value: detailTransaction.name
        },
        {
            title: "Amount",
            value: (detailTransaction.transactionType === TransactionType.EXPENSE ? '-' : '') + formatCurrency(detailTransaction.transactionAmount || 0, detailTransaction.currencyCode)
        },
        {
            title: "Receiver",
            value: transactionPartners ? (transactionPartners.find(partner => partner.uid === detailTransaction.transactionExecutorUid)?.name || "Unknown") : "Loading..."
        },
        {
            title: "Date",
            value: speakableDate(getDateFromStandardString(detailTransaction.date))
        },
        {
            title: "Category",
            value: categories ? categories.find(category => category.uid === detailTransaction.categoryUid)?.name : "Loading..."
        },
        {
            title: "Labels",
            value: labels ? detailTransaction.labels.map(labelUid => labels.find(label => label.uid === labelUid)?.name) : "Loading..."
        },
        {
            title: "Notes",
            value: detailTransaction.notes
        },
        {
            title: "Repetition",
            value: new RepetitionHelper(detailTransaction.repetition).toSpeakableText()
        }, {
            title: "Next repetition",
            value: !detailTransaction.history && (detailTransaction.repetition.repetitionAmount || 2) > 1 ? speakableDate(getDateFromStandardString(new RepetitionHelper(transaction.repetition).calculateNextRepetitionDate(detailTransaction.date))) : null
        }
    ]

    return (
        <DialogOverlay actions={[
            new ContentAction(
                "Edit",
                () => {
                    dialog.open(
                        new DialogModel(
                            "Edit transaction",
                            <CreateTransactionDialog transaction={detailTransaction} />
                        )
                    )
                }
            ),
            new ContentAction(
                "Copy",
                () => {
                    navigator.clipboard.writeText(JSON.stringify(detailTransaction))
                    toast.open("StorageItem copied to clipboard")
                }
            ),
            new ContentAction(
                "Delete",
                () => {
                    dialog.closeCurrent();
                    deleteDBItem(DatabaseRoutes.TRANSACTIONS, detailTransaction)
                }
            ),
        ]}>
            <div className="transaction-detail-dialog">
                { details.filter((detail) => detail.value?.length).map((detail, index) => {
                    return <div className="transaction-detail-dialog-row">
                        <div className="transaction-detail-dialog-row">
                            <span id="transaction-detail-dialog-row-title">{detail.title}</span>
                            <span id="transaction-detail-dialog-row-value">{
                                Array.isArray(detail.value) ? <div className="transaction-detail-dialog-row-labels">
                                    {detail.value.map((label) => <span className="transaction-detail-dialog-row-label">{label}</span>)}
                                </div> : detail.value
                            }</span>
                        </div>
                    </div>
                })}
            </div>

        </DialogOverlay>
    );
};

export default TransactionDetailDialog;