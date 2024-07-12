import React, {useEffect} from 'react';

// @ts-ignore
import variables from "../../../Data/Variables.scss";
import {MdAttachMoney, MdDescription, MdTune} from "react-icons/md";
import DebtBasicsTab from "./BasicsTab/DebtBasicsTab";
import DebtDistributionTab from "./DistributionTab/DebtDistributionTab";
import DebtDescriptionTab from "./DescriptionTab/DebtDescriptionTab";
import {useDialog} from "../../../Providers/DialogProvider";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {
    addDBItem,
    deleteDBItemByUid,
    getDBItemByUid,
    getDBItemOnChange,
    updateDBItem
} from "../../../Helper/AceBaseHelper";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/useCategories";
import {useLabels} from "../../../CustomHooks/useLabels";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtPresetModel} from "../../../Data/DatabaseModels/DebtPresetModel";
import {CreateDebtInputErrorModel} from "../../../Data/ErrorModels/CreateDebtInputErrorModel";
import {DBItem} from "../../../Data/DatabaseModels/DBItem";
import {CreateDialogNewItems} from "../../../Data/DataModels/CreateDialogNewItems";
import uuid from "react-uuid";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import EditStorageItemDialog from "../EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../../../Data/DatabaseModels/StorageItemModel";
import {useNewItems} from "../../../CustomHooks/useNewItems";
import {DistributionModel} from "../../../Data/DataModels/DistributionModel";

const CreateDebtDialog = ({
    debt,
    isPreset = false,
    preset
 }: {
    debt?: DebtModel,
    isPreset?: boolean,
    preset?: DebtPresetModel,
}) => {
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()
    const getDatabaseRoute = useDatabaseRoute()
    const dialog = useDialog()
    const toast = useToast()

    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [presetIcon, setPresetIcon] = React.useState<InputNameValueModel<string> | null>(null)
    const [presetName, setPresetName] = React.useState<string>("")

    const [workDebt, setWorkDebt] = React.useState<DebtModel | null>(null)
    const [inputError, setInputError] = React.useState<CreateDebtInputErrorModel>(new CreateDebtInputErrorModel())

    const {
        newItems,
        addNewItems,
        getDbItemContextMenuOptions,
        checkDBItem
    } = useNewItems(workDebt, setWorkDebt as React.Dispatch<React.SetStateAction<DBItem | null>>)

    const transactionPartners = useTransactionPartners(null)
    const categories = useCategories()
    const labels = useLabels()

    useEffect(() => {
        currentAccount && !workDebt && setWorkDebt(new DebtModel(currentAccount.currencyCode))
    }, [currentAccount]);

    const updateDebt = (updater: (oldDebt: DebtModel) => DebtModel) => {
        setWorkDebt((current) => {
            const newDebt = new DebtModel(currentAccount?.currencyCode);
            Object.assign(newDebt, updater(current!));
            return newDebt
        })
    }

    useEffect(() => {
        updateDebt((oldDebt) => {
            const distributions: DistributionModel[] = [];

            oldDebt.whoWasPaiFor.forEach((whoWasPaidFor) => {
                distributions.push(new DistributionModel(whoWasPaidFor, 100 / oldDebt.whoWasPaiFor.length));
            })

            return {
                ...oldDebt,
                distributions: distributions
            }
        })
    }, [workDebt?.transactionAmount, workDebt?.whoWasPaiFor, workDebt?.currency]);

    useEffect(() => {
        if (getDatabaseRoute && debt && debt.uid) {
            getDBItemOnChange(
                getDatabaseRoute(DatabaseRoutes.DEBTS),
                debt.uid, (changedTransaction
            ) => {
                setWorkDebt(changedTransaction as DebtModel)
            })
        } else if (debt) {
            setWorkDebt(debt)
        }
    }, [getDatabaseRoute]);

    useEffect(() => {
        if (!debt || !getDatabaseRoute) return

        if (debt.transactionExecutorUid) {
            checkDBItem(debt, DatabaseRoutes.TRANSACTION_PARTNERS, "transactionExecutorUid")
        }
        if (debt.whoHasPaidUid) {
            checkDBItem(debt, DatabaseRoutes.TRANSACTION_PARTNERS, "whoHasPaidUid")
        }
        checkDBItem(debt, DatabaseRoutes.TRANSACTION_PARTNERS, "whoWasPaiFor")
        if (debt.categoryUid) {
            checkDBItem(debt, DatabaseRoutes.CATEGORIES, "categoryUid")
        }
        checkDBItem(debt, DatabaseRoutes.LABELS, "labels")
    }, [getDatabaseRoute]);

    if(!workDebt) {
        return <LoadingDialog />
    } else {
        const getTab = (tab: number) => {
            switch (tab) {
                case 0:
                    return <DebtBasicsTab
                        inputError={inputError}
                        isPreset={isPreset}
                        presetIcon={presetIcon}
                        setPresetIcon={setPresetIcon}
                        presetName={presetName}
                        setPresetName={setPresetName}
                        workDebt={workDebt}
                        updateDebt={updateDebt}
                        transactionPartners={transactionPartners}
                        newItems={newItems}
                        addNewItems={addNewItems}
                        getDbItemContextMenuOptions={getDbItemContextMenuOptions}
                    />;
                case 1:
                    return <DebtDistributionTab
                        workDebt={workDebt}
                        updateDebt={updateDebt}
                        transactionPartners={transactionPartners}
                        newItems={newItems}
                    />
                case 2:
                    return <DebtDescriptionTab
                        inputError={inputError}
                        workDebt={workDebt}
                        updateDebt={updateDebt}
                        categories={categories}
                        labels={labels}
                        newItems={newItems}
                        addNewItems={addNewItems}
                        getDbItemContextMenuOptions={getDbItemContextMenuOptions}
                    />
            }
        }

        const validateInput = () => {
            if (!workDebt.name) {
                toast.open(translate("please-enter-a-transaction-name"))
                setInputError((old) => {
                    old.nameError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workDebt.transactionAmount) {
                toast.open(translate("please-enter-an-transaction-amount"))
                setInputError((old) => {
                    old.transactionAmountError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workDebt.transactionExecutorUid) {
                toast.open(translate("please-enter–a-transaction-partner"))
                setInputError((old) => {
                    old.transactionExecutorError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workDebt.whoHasPaidUid) {
                toast.open(translate("please-enter–a-transaction-partner"))
                setInputError((old) => {
                    old.whoHasPaidError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workDebt.whoWasPaiFor) {
                toast.open(translate("please-enter–a-transaction-partner"))
                setInputError((old) => {
                    old.whoWasPaidForError = true;
                    return old
                })
                setCurrentTab(0)
                return false
            } else if (!workDebt.categoryUid) {
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
                const allTransactionPartners = [...transactionPartners, ...newItems.newTransactionPartners]
                workDebt.transactionExecutorFallback = allTransactionPartners.find(partner => partner.uid === workDebt.transactionExecutorUid)?.name || workDebt.transactionExecutorFallback
                workDebt.whoHasPaidFallback = allTransactionPartners.find(partner => partner.uid === workDebt.whoHasPaidUid)?.name || workDebt.whoHasPaidFallback
                workDebt.whoWasPaiForFallback = workDebt.whoWasPaiFor.map(whoWasPaiForUid => allTransactionPartners.find(whoWasPaiFor => whoWasPaiFor.uid === whoWasPaiForUid)?.name || "")
                newItems.newTransactionPartners.forEach((newTransactionPartner) => {
                    promises.push(
                        addDBItem(
                            getDatabaseRoute(DatabaseRoutes.TRANSACTION_PARTNERS),
                            newTransactionPartner
                        )
                    )
                })
            }

            if (categories) {
                workDebt.categoryFallback = [...categories, ...newItems.newCategories]?.find(category => category.uid === workDebt.categoryUid)?.name || workDebt.categoryFallback
                newItems.newCategories.forEach((newCategory) => {
                    promises.push(
                        addDBItem(
                            getDatabaseRoute(DatabaseRoutes.CATEGORIES),
                            newCategory
                        )
                    )
                })
            }

            if (labels) {
                workDebt.labelsFallback = workDebt.labels.map(labelUid => [...labels, ...newItems.newLabels].find(label => label.uid === labelUid)?.name || "")
                newItems.newLabels.forEach((newLabel) => {
                    promises.push(
                        addDBItem(
                            getDatabaseRoute(DatabaseRoutes.LABELS),
                            newLabel
                        )
                    )
                })
            }

            return promises
        }

        return (
            <DialogOverlay actions={currentTab === 2 ? (!debt?.uid || isPreset ? [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1)),
                new ContentAction(translate("create"), () => {
                    setInputError(new CreateDebtInputErrorModel())

                    if (!isPreset && !validateInput()) return
                    if (!getDatabaseRoute || !currentAccount) return;

                    Promise.all(addNewValues()).then(() => {
                        if (isPreset) {
                            addDBItem(
                                getDatabaseRoute(DatabaseRoutes.PRESETS),
                                new DebtPresetModel(
                                    currentAccount.uid,
                                    presetIcon?.value!,
                                    presetName,
                                    workDebt,
                                    currentAccount?.currencyCode
                                )
                            ).then(() => {
                                dialog.closeCurrent();
                            })
                        } else {
                            workDebt.accountId = currentAccount.uid

                            addDBItem(
                                getDatabaseRoute(DatabaseRoutes.DEBTS),
                                workDebt
                            ).then(() => {
                                if (!preset) {
                                    dialog.closeCurrent();
                                    return
                                }

                                updateDBItem(
                                    getDatabaseRoute(DatabaseRoutes.PRESETS),
                                    {
                                        ...preset,
                                        presetTransaction: {
                                            ...preset!.presetDebt,
                                            transactionExecutorUid: preset!.presetDebt.transactionExecutorUid ? workDebt.transactionExecutorUid : null,
                                            whoHasPaidUid: preset!.presetDebt.whoHasPaidUid ? workDebt.whoHasPaidUid : null,
                                            whoWasPaiFor: preset!.presetDebt.whoWasPaiFor ? workDebt.whoWasPaiFor : null,
                                            categoryUid: preset!.presetDebt.categoryUid ? workDebt.categoryUid : null,
                                            labels: preset!.presetDebt.labels.length ? workDebt.labels : [],
                                        } as DebtModel
                                    } as DebtPresetModel
                                ).then(() => {
                                    dialog.closeCurrent();
                                })
                            })
                        }
                    })
                }, false, getDatabaseRoute === null || currentAccount === null),
            ] : [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1)),
                new ContentAction(translate("edit"), () => {
                    if (!validateInput()) return
                    if (!currentAccount) return;

                    Promise.all(addNewValues()).then(() => {
                        // workTransaction.newTransactionPartner = transactionPartners?.find(partner => partner.uid === workTransaction.transactionExecutorUid)?.name || workTransaction.newTransactionPartner
                        // workTransaction.newCategory = categories.find(category => category.uid === workTransaction.categoryUid)?.name || workTransaction.newCategory
                        // workTransaction.newLabels = workTransaction.labels.map(labelUid => labels.find(label => label.uid === labelUid)?.name || "")

                        updateDBItem(
                            getDatabaseRoute!(DatabaseRoutes.DEBTS),
                            workDebt
                        ).then(() => {
                            dialog.closeCurrent();
                        })
                    })
                }, false, getDatabaseRoute === null || currentAccount === null),
            ]) : [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1), currentTab === 0),
                new ContentAction(translate("next"), () => setCurrentTab(currentTab + 1)),
            ]}>
                <div className="create-transaction-dialog-navigation">
                    <div>
                        <MdAttachMoney
                            className={currentTab === 0 ? "selected" : ""}
                            onClick={() => {
                                setCurrentTab(0)
                            }}
                        />
                        <span>{translate("basics")}</span>
                    </div>
                    <div>
                        <MdTune
                            className={currentTab === 1 ? "selected" : ""}
                            onClick={() => {
                                setCurrentTab(1)
                            }}
                        />
                        <span>{translate("distribution")}</span>
                    </div>
                    <div>
                        <MdDescription
                            className={currentTab === 2 ? "selected" : ""}
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

export default CreateDebtDialog;