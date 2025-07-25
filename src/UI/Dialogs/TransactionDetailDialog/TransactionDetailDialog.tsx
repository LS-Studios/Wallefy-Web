import React, {useEffect, useState} from 'react';
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
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {getIcon} from "../../../Helper/IconMapper";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";

const TransactionDetailDialog = ({
    transaction,
    preFetchedTransactionPartners,
 }: {
    transaction: TransactionModel,
    preFetchedTransactionPartners: TransactionPartnerModel[] | null,
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const getDatabaseRoute = useAccountRoute()
    const dialog = useDialog()
    const toast = useToast()

    const [detailTransaction, setDetailTransaction] = React.useState<TransactionModel>(structuredClone(transaction))
    const transactionPartners = useTransactionPartners(preFetchedTransactionPartners || [])
    const categories = useCategories()
    const labels = useLabels()

    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemOnChange(
            getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
            transaction.uid,
            (fetchedTransaction: TransactionModel | null) => {
                if (fetchedTransaction) {
                    setDetailTransaction(fetchedTransaction)
                }
            }
        )
    }, [getDatabaseRoute]);

    const Icon = getIcon(detailTransaction.icon || "")

    const details = [
        {
            title: translate("name"),
            value: detailTransaction.name,
        },
        {
            title: translate("icon"),
            value: <div className="transaction-detail-dialog-icon-row">{translate(detailTransaction.icon || "")} <Icon /></div>,
            expandOnRight: true
        },
        {
            title: translate("transaction-amount-short"),
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
            value: !detailTransaction.repetition.isPending && !detailTransaction.repetition.isPaused ? speakableDate(new Date(detailTransaction.date), settings?.language || "de", translate) : null,
            expandOnRight: true
        },
        {
            title: translate("category"),
            value: categories ? categories.find(category => category.uid === detailTransaction.categoryUid)?.name : translate("loading")
        },
        {
            title: translate("labels"),
            value: labels ? detailTransaction.labels && detailTransaction.labels.reduce((result: string[], labelUid) => {
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
                    dialog.closeCurrent()

                    dialog.open(
                        new DialogModel(
                            translate("edit-transaction"),
                            <CreateTransactionDialog transaction={detailTransaction} />
                        )
                    )
                },
                false,
                isLoading
            ),
            new ContentAction(
                translate("copy"),
                () => {
                    navigator.clipboard.writeText(JSON.stringify(detailTransaction))
                    toast.open(translate("copied"))
                },
                false,
                isLoading
            ),
            // new ContentAction(
            //     translate("execute"),
            //     () => {
            //         executeTransaction(
            //             detailTransaction,
            //             currentAccount!,
            //             updateAccountBalance,
            //             getDatabaseRoute!
            //         )
            //         dialog.closeCurrent()
            //     },
            //     false,
            //     !currentAccount || !getDatabaseRoute
            // ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (!currentAccount) return

                    const transactionPath = detailTransaction.history ? DatabaseRoutes.HISTORY_TRANSACTIONS : DatabaseRoutes.TRANSACTIONS

                    setIsLoading(true)

                    getActiveDatabaseHelper().deleteDBItem(
                        getDatabaseRoute!(transactionPath),
                        detailTransaction
                    ).then(() => {
                        setIsLoading(false)
                        dialog.closeCurrent();
                    })
                },
                false,
                getDatabaseRoute === null
            ),
        ]}>
            <div className="transaction-detail-dialog">
                { details.filter((detail) => {
                    return Array.isArray(detail.value) ? detail.value.length : detail.value
                }).map((detail, index) => {
                    return <div key={index} className="transaction-detail-dialog-row">
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