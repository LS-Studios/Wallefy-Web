import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {speakableDate} from "../../../Helper/DateHelper";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useDatabaseRoute} from "../../../CustomHooks/Database/useDatabaseRoute";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import CreateDebtDialog from "../CreateDebtDialog/CreateDebtDialog";
import "../TransactionDetailDialog/TransactionDetailDialog.scss";
import {roundToNearest} from "../../../Helper/CalculationHelper";
import {getIcon} from "../../../Helper/IconMapper";
import {DebtType} from "../../../Data/EnumTypes/DebtType";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";

const DebtDetailDialog = ({
    debt,
    preFetchedTransactionPartners,
 }: {
    debt: DebtModel,
    preFetchedTransactionPartners: TransactionPartnerModel[] | null,
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const getDatabaseRoute = useDatabaseRoute()
    const dialog = useDialog()
    const toast = useToast()

    const [detailDebt, setDetailDebt] = React.useState<DebtModel>(structuredClone(debt))
    const transactionPartners = useTransactionPartners(preFetchedTransactionPartners || [])
    const categories = useCategories()
    const labels = useLabels()

    useEffect(() => {
        if (!getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemOnChange(
            getDatabaseRoute(DatabaseRoutes.DEBTS),
            debt.uid,
            (fetchedDebt: DebtModel | null) => {
                if (fetchedDebt) {
                    setDetailDebt(fetchedDebt)
                }
            }
        )
    }, [getDatabaseRoute]);

    const Icon = getIcon(detailDebt.icon || "")

    const details = [
        {
            title: translate("name"),
            value: detailDebt.name,
        },
        {
            title: translate("icon"),
            value: detailDebt.debtType === DebtType.DEFAULT && <div className="transaction-detail-dialog-icon-row">{translate(detailDebt.icon || "")} <Icon /></div>,
            expandOnRight: true
        },
        {
            title: translate("transaction-amount-short"),
            value: <div>
                <span>{formatCurrency(detailDebt.transactionAmount || 0, settings?.language, detailDebt.currency.baseCurrencyCode)}</span>
                { detailDebt.currency.currencyCode !== currentAccount?.currencyCode && <>
                    <br/>
                    ( <span>{formatCurrency(detailDebt.transactionAmount || 0, settings?.language, detailDebt.currency.currencyCode)}</span> )
                </> }
            </div>
        },
        {
            title: translate("receiver"),
            value: detailDebt.debtType === DebtType.DEFAULT && (transactionPartners ? (transactionPartners.find(partner => partner.uid === detailDebt.transactionExecutorUid)?.name || translate("unknown")) : translate("loading"))
        },
        {
            title: translate("who-has-paid"),
            value: transactionPartners ? (transactionPartners.find(partner => partner.uid === detailDebt.whoHasPaidUid)?.name || translate("unknown")) : translate("loading")
        },
        {
            title: translate("who-was-paid-for"),
            value: detailDebt.debtType === DebtType.DEFAULT ? (transactionPartners ? detailDebt.whoWasPaiFor.reduce((result: string[], whoWasPaiForUid) => {
                const foundWhoWasPaiFor = transactionPartners.find(transactionPartner => transactionPartner.uid === whoWasPaiForUid)
                if (foundWhoWasPaiFor) {
                    const percentage = detailDebt.distributions.find(distribution => distribution.transactionPartnerUid === whoWasPaiForUid)?.percentage || 0
                    result.push(foundWhoWasPaiFor.name + " (" +
                        roundToNearest(percentage) + "%, " +
                        formatCurrency(
                            detailDebt.transactionAmount! * (percentage / 100),
                            settings?.language,
                            detailDebt.currency.baseCurrencyCode
                        )
                        + ")"
                    )
                }
                return result
            }, []) : translate("loading")) : transactionPartners ? (transactionPartners.find(partner => partner.uid === detailDebt.whoWasPaiFor[0])?.name || translate("unknown")) : translate("loading"),
            expandOnRight: detailDebt.debtType === DebtType.DEFAULT
        },
        {
            title: translate("date"),
            value: !speakableDate(new Date(detailDebt.date), settings?.language || "de", translate)
        },
        {
            title: translate("category"),
            value: categories ? categories.find(category => category.uid === detailDebt.categoryUid)?.name : translate("loading")
        },
        {
            title: translate("labels"),
            value: labels ? detailDebt.labels.reduce((result: string[], labelUid) => {
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
            value: detailDebt.notes
        },
    ]

    return (
        <DialogOverlay actions={detailDebt.debtType === DebtType.DEFAULT ? [
            new ContentAction(
                translate("edit"),
                () => {
                    dialog.open(
                        new DialogModel(
                            translate("edit-transaction"),
                            <CreateDebtDialog debt={detailDebt} />
                        )
                    )
                }
            ),
            new ContentAction(
                translate("copy"),
                () => {
                    navigator.clipboard.writeText(JSON.stringify(detailDebt))
                    toast.open(translate("transaction-copied-to-clipboard"))
                }
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (!currentAccount) return

                    dialog.closeCurrent();

                    getActiveDatabaseHelper().deleteDBItem(
                        getDatabaseRoute!(DatabaseRoutes.DEBTS),
                        detailDebt
                    )
                },
                false,
                getDatabaseRoute === null
            ),
        ] : [
            new ContentAction(
                translate("copy"),
                () => {
                    navigator.clipboard.writeText(JSON.stringify(detailDebt))
                    toast.open(translate("transaction-copied-to-clipboard"))
                }
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (!currentAccount) return

                    dialog.closeCurrent();

                    getActiveDatabaseHelper().deleteDBItem(
                        getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                        detailDebt
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

export default DebtDetailDialog;