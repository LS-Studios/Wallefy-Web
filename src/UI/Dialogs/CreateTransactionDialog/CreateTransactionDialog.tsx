import React, {useEffect, useState} from 'react';
import './CreateTransactionDialog.scss';
import {MdAttachMoney, MdDescription, MdRepeat} from "react-icons/md";
import BasicsTab from "./BasicsTab/BasicsTab";
import RepetitionTab from "./RepetitionTab/RepetitionTab";
import DescriptionTab from "./DescriptionTab/DescriptionTab";
import {useDialog} from "../../../Providers/DialogProvider";
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {TransactionPresetModel} from "../../../Data/DatabaseModels/TransactionPresetModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {CreateTransactionInputErrorModel} from "../../../Data/ErrorModels/CreateTransactionInputErrorModel";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {ExecutionType} from "../../../Data/EnumTypes/ExecutionType";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {useNewItems} from "../../../CustomHooks/useNewItems";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import storageItem from "../../Screens/Storage/StorageItem/StorageItem";

const CreateTransactionDialog = ({
    transaction
 }: {
    transaction?: TransactionModel
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const getDatabaseRoute = useAccountRoute()
    const dialog = useDialog()
    const toast = useToast()

    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [presetIcon, setPresetIcon] = React.useState<InputNameValueModel<string> | null>(null)
    const [presetName, setPresetName] = React.useState<string>("")

    const [workTransaction, setWorkTransaction] = React.useState<TransactionModel | null>(null)
    const [inputError, setInputError] = React.useState<CreateTransactionInputErrorModel>(new CreateTransactionInputErrorModel())

    const [isLoading, setIsLoading] = useState<boolean>(false)

    const {
        newItems,
        clearNewItems,
        addNewItems,
        getDbItemContextMenuOptions,
        checkDBItem
    } = useNewItems()

    const transactionPartners = useTransactionPartners(null)
    const categories = useCategories()
    const labels = useLabels()

    const updateTransaction = (updater: (oldTransaction: TransactionModel) => TransactionModel) => {
        setWorkTransaction((current) => {
            const newTransaction = new TransactionModel(currentAccount?.currencyCode);
            Object.assign(newTransaction, updater(current!));
            return newTransaction
        })
    }

    const setNewWorkTransactionUp = (transaction: TransactionModel, account: AccountModel) => {
        checkTransactionUids(transaction, account).then((transaction) => {
            setWorkTransaction(transaction)
        })
    }

    const checkTransactionUids = (transaction: TransactionModel, account: AccountModel): Promise<TransactionModel> => {
        return new Promise<TransactionModel>((resolve) => {
            const promises: Promise<any>[] = []

            clearNewItems()

            if (transaction.transactionExecutorUid) {
                promises.push(
                    checkDBItem(
                        transaction,
                        DatabaseRoutes.TRANSACTION_PARTNERS,
                        "transactionExecutorUid",
                        new TransactionPartnerModel(account.uid, transaction.transactionExecutorFallback || "", false),
                        "newTransactionPartners"
                    )
                )
            }
            if (transaction.categoryUid) {
                promises.push(
                    checkDBItem(
                        transaction,
                        DatabaseRoutes.CATEGORIES,
                        "categoryUid",
                        new CategoryModel(account.uid, transaction.categoryFallback || ""),
                        "newCategories"
                    )
                )
            }
            if (transaction.labelsFallback) {
                promises.push(
                    checkDBItem(
                        transaction,
                        DatabaseRoutes.LABELS,
                        "labels",
                        Object.fromEntries(Object.entries(transaction.labelsFallback).map(([uid, value]) => [uid, new LabelModel(account.uid, value)])),
                        "newLabels"
                    )
                )
            }

            Promise.all(promises).then((result) => {
                resolve(result[0])
            })
        })
    }

    useEffect(() => {
        if (!getDatabaseRoute || !currentAccount) return

        if (transaction && transaction.uid) {
            getActiveDatabaseHelper().getDBItemOnChange(
                getDatabaseRoute(transaction.history ? DatabaseRoutes.HISTORY_TRANSACTIONS : DatabaseRoutes.TRANSACTIONS),
                transaction.uid,
                (changedTransaction) => {
                    changedTransaction && setNewWorkTransactionUp(changedTransaction as TransactionModel, currentAccount)
            })
        } else if (transaction) {
            setNewWorkTransactionUp(transaction, currentAccount)
        } else {
            setWorkTransaction(new TransactionModel(currentAccount.currencyCode))
        }
    }, [getDatabaseRoute, currentAccount]);

    if(!workTransaction) {
        return <LoadingDialog />
    } else {
        const getTab = (tab: number) => {
            switch (tab) {
                case 0:
                    return <BasicsTab
                        inputError={inputError}
                        workTransaction={workTransaction}
                        updateTransaction={updateTransaction}
                        transactionPartners={transactionPartners}
                        newItems={newItems}
                        addNewItems={addNewItems}
                        getDbItemContextMenuOptions={getDbItemContextMenuOptions}
                    />;
                case 1:
                    return <RepetitionTab
                        workTransaction={workTransaction}
                        updateTransaction={updateTransaction}
                    />
                case 2:
                    return <DescriptionTab
                        inputError={inputError}
                        workTransaction={workTransaction}
                        updateTransaction={updateTransaction}
                        categories={categories}
                        labels={labels}
                        newItems={newItems}
                        addNewItems={addNewItems}
                        getDbItemContextMenuOptions={getDbItemContextMenuOptions}
                    />
            }
        }

        const validateInput = () => {
            if (!workTransaction.name) {
                toast.open(translate("please-enter-a-transaction-name"))
                setInputError((old) => {
                    old.nameError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workTransaction.transactionAmount) {
                toast.open(translate("please-enter-an-transaction-amount"))
                setInputError((old) => {
                    old.transactionAmountError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workTransaction.transactionExecutorUid) {
                toast.open(translate("please-enter–a-transaction-partner"))
                setInputError((old) => {
                    old.transactionPartnerError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workTransaction.categoryUid) {
                toast.open(translate("please-enter-a-category"))
                setInputError((old) => {
                    old.categoryError = true;
                    return old
                })
                setCurrentTab(2)
                return false
            }

            return true
        }

        const addNewValues = () => {
            const promises: Promise<any>[] = []

            //TODO maybe whait until account ist fetched completle or show loading
            if (!getDatabaseRoute || !currentAccount) return promises

            if (transactionPartners) {
                workTransaction.transactionExecutorFallback = [...transactionPartners, ...newItems.newTransactionPartners].find(partner => partner.uid === workTransaction.transactionExecutorUid)?.name || workTransaction.transactionExecutorFallback
                newItems.newTransactionPartners.forEach((newTransactionPartner) => {
                    promises.push(
                        getActiveDatabaseHelper().addDBItem(
                            getDatabaseRoute(DatabaseRoutes.TRANSACTION_PARTNERS),
                            newTransactionPartner
                        )
                    )
                })
            }

            if (categories) {
                workTransaction.categoryFallback = [...categories, ...newItems.newCategories]?.find(category => category.uid === workTransaction.categoryUid)?.name || workTransaction.categoryFallback
                newItems.newCategories.forEach((newCategory) => {
                    promises.push(
                        getActiveDatabaseHelper().addDBItem(
                            getDatabaseRoute(DatabaseRoutes.CATEGORIES),
                            newCategory
                        )
                    )
                })
            }

            if (labels) {
                workTransaction.labelsFallback = workTransaction.labels && Object.fromEntries(workTransaction.labels.map(labelUid => [labelUid, [...labels, ...newItems.newLabels].find(label => label.uid === labelUid)?.name || ""]))

                newItems.newLabels.forEach((newLabel) => {
                    promises.push(
                        getActiveDatabaseHelper().addDBItem(
                            getDatabaseRoute(DatabaseRoutes.LABELS),
                            newLabel
                        )
                    )
                })
            }

            return promises
        }

        return (
            <DialogOverlay actions={currentTab === 2 ? (!transaction?.uid ? [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1), false, isLoading),
                new ContentAction(translate("create"), () => {
                    setInputError(new CreateTransactionInputErrorModel())

                    if (!validateInput()) return
                    if (!getDatabaseRoute || !currentAccount) return;

                    setIsLoading(true)

                    Promise.all(addNewValues()).then(() => {
                        let transactionPath = DatabaseRoutes.TRANSACTIONS

                        if (workTransaction.repetition.executionType !== ExecutionType.LATER) {
                            transactionPath = DatabaseRoutes.HISTORY_TRANSACTIONS
                            workTransaction.history = true
                        }

                        workTransaction.accountUid = currentAccount.uid

                        getActiveDatabaseHelper().addDBItem(
                            getDatabaseRoute(transactionPath),
                            workTransaction
                        ).then(() => {
                            dialog.closeCurrent();
                        })
                    })
                }, false, isLoading || getDatabaseRoute === null || currentAccount === null),
            ] : [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1), false, isLoading),
                new ContentAction(translate("edit"), () => {
                    if (!validateInput()) return
                    if (!currentAccount) return;

                    setIsLoading(true)

                    Promise.all(addNewValues()).then(() => {
                        // workTransaction.newTransactionPartner = transactionPartners?.find(partner => partner.uid === workTransaction.transactionExecutorUid)?.name || workTransaction.newTransactionPartner
                        // workTransaction.newCategory = categories.find(category => category.uid === workTransaction.categoryUid)?.name || workTransaction.newCategory
                        // workTransaction.newLabels = workTransaction.labels.map(labelUid => labels.find(label => label.uid === labelUid)?.name || "")

                        getActiveDatabaseHelper().updateDBItem(
                            getDatabaseRoute!(DatabaseRoutes.TRANSACTIONS),
                            workTransaction
                        ).then(() => {
                            setIsLoading(false)
                            dialog.closeCurrent();
                        })
                    })
                }, false, isLoading || getDatabaseRoute === null || currentAccount === null),
            ]) : [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1), currentTab === 0),
                new ContentAction(translate("next"), () => setCurrentTab(currentTab + 1)),
            ]}>
                <div className="create-transaction-dialog-navigation">
                    <div className={currentTab === 0 ? "selected" : ""}>
                        <MdAttachMoney
                            onClick={() => {
                                setCurrentTab(0)
                            }}
                        />
                        <span>{translate("basics")}</span>
                    </div>
                    <div className={currentTab === 1 ? "selected" : ""}>
                        <MdRepeat
                            onClick={() => {
                                setCurrentTab(1)
                            }}
                        />
                        <span>{translate("repetition")}</span>
                    </div>
                    <div className={currentTab === 2 ? "selected" : ""}>
                        <MdDescription
                            onClick={() => {
                                setCurrentTab(2)
                            }}
                        />
                        <span>{translate("description")}</span>
                    </div>
                </div>
                {
                    getTab(currentTab)
                }
            </DialogOverlay>
        );
    }
};

export default CreateTransactionDialog;