import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {speakableDate} from "../../../Helper/DateHelper";

import './TransactionDetailDialog.scss';
import {formatCurrency, formatCurrencyFromTransaction, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import CreateTransactionDialog from "../CreateTransactionDialog/CreateTransactionDialog";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import {RepetitionHelper} from "../../../Helper/RepetitionHelper";
import {deleteDBItem, getDBItemOnChange, getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/useCategories";
import {useLabels} from "../../../CustomHooks/useLabels";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";

const TransactionDetailDialog = ({
    transaction,
    preFetchedTransactionPartners,
 }: {
    transaction: TransactionModel,
    preFetchedTransactionPartners: TransactionPartnerModel[] | null,
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()
    const getDatabaseRoute = useDatabaseRoute()
    const dialog = useDialog()
    const toast = useToast()

    const [detailTransaction, setDetailTransaction] = React.useState<TransactionModel>(structuredClone(transaction))
    const transactionPartners = useTransactionPartners(preFetchedTransactionPartners || [])
    const categories = useCategories()
    const labels = useLabels()

    useEffect(() => {
        if (!getDatabaseRoute) return

        getDBItemOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
            transaction.uid,
            (fetchedTransaction: TransactionModel | null) => {
                if (fetchedTransaction) {
                    setDetailTransaction(fetchedTransaction)
                }
            }
        )
    }, [getDatabaseRoute]);

    const details = [
        {
            title: translate("name"),
            value: detailTransaction.name,
        },
        {
            title: translate("transaction-amount"),
            value: <div>
                <span>{formatCurrencyFromTransaction(detailTransaction, settings?.language)}</span>
                { detailTransaction.currency.currencyCode !== currentAccount?.currencyCode && <>
                    <br/>
                    ( <span>{formatCurrency(
                        getTransactionAmount(detailTransaction, currentAccount?.currencyCode),
                        settings?.language,
                        currentAccount?.currencyCode
                    )}</span> )
                </> }
            </div>
        },
        {
            title: translate("receiver"),
            value: transactionPartners ? (transactionPartners.find(partner => partner.uid === detailTransaction.transactionExecutorUid)?.name || translate("unknown")) : translate("loading")
        },
        {
            title: translate("date"),
            value: !detailTransaction.repetition.isPending && !detailTransaction.repetition.isPaused ? speakableDate(new Date(detailTransaction.date), settings?.language || "de", translate) : null
        },
        {
            title: translate("category"),
            value: categories ? categories.find(category => category.uid === detailTransaction.categoryUid)?.name : translate("loading")
        },
        {
            title: translate("labels"),
            value: labels ? detailTransaction.labels.reduce((result: string[], labelUid) => {
                const foundLabel = labels.find(label => label.uid === labelUid)
                if (foundLabel) {
                    result.push(foundLabel.name)
                }
                return result
            }, []) : translate("loading"),
            expandOnRight: true
        },
        {
            title: translate("notes"),
            value: detailTransaction.notes
        },
        {
            title: translate("repetition"),
            value: !detailTransaction.history ? new RepetitionHelper(detailTransaction).toSpeakableText() : ""
        },
        {
            title: translate("next-repetition"),
            value: getDatabaseRoute ? (!detailTransaction.history ? (detailTransaction.repetition.isPaused ? translate("paused") : detailTransaction.repetition.isPending ? translate("pending") : (detailTransaction.repetition.repetitionAmount || 2) > 1 ? speakableDate(new Date(new RepetitionHelper(detailTransaction).calculateNextRepetitionDate(getDatabaseRoute)!), settings?.language || "de", translate) : null) : null) : translate("loading")
        }
    ]

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("edit"),
                () => {
                     if (transaction.future) dialog.closeCurrent()

                    dialog.open(
                        new DialogModel(
                            translate("edit-transaction"),
                            <CreateTransactionDialog transaction={detailTransaction} />
                        )
                    )
                }
            ),
            new ContentAction(
                translate("copy"),
                () => {
                    navigator.clipboard.writeText(JSON.stringify(detailTransaction))
                    toast.open(translate("transaction-copied-to-clipboard"))
                }
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (!currentAccount) return

                    dialog.closeCurrent();

                    const transactionPath = detailTransaction.history ? DatabaseRoutes.HISTORY_TRANSACTIONS : DatabaseRoutes.TRANSACTIONS

                    deleteDBItem(
                        getDatabaseRoute!(transactionPath),
                        detailTransaction
                    )
                },
                false,
                getDatabaseRoute === null
            ),
        ]}>
            <div className="transaction-detail-dialog">
                { details.filter((detail) => {
                    return Array.isArray(detail.value) ? detail.value.length : detail.value
                }).map((detail, index) => {
                    return <div className="transaction-detail-dialog-row">
                        <div className={"transaction-detail-dialog-row " + (detail.expandOnRight ? "expand-on-right" : "")}>
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