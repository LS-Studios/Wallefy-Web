import React, {useEffect} from 'react';

import {MdAttachMoney, MdDescription, MdTune} from "react-icons/md";
import DebtBasicsTab from "./BasicsTab/DebtBasicsTab";
import DebtDistributionTab from "./DistributionTab/DebtDistributionTab";
import DebtDescriptionTab from "./DescriptionTab/DebtDescriptionTab";
import {useDialog} from "../../../Providers/DialogProvider";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../Data/DataModels/Input/InputNameValueModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useDatabaseRoute} from "../../../CustomHooks/Database/useDatabaseRoute";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtPresetModel} from "../../../Data/DatabaseModels/DebtPresetModel";
import {CreateDebtInputErrorModel} from "../../../Data/ErrorModels/CreateDebtInputErrorModel";
import {useNewItems} from "../../../CustomHooks/useNewItems";
import {DistributionModel} from "../../../Data/DataModels/DistributionModel";
import {DebtType} from "../../../Data/EnumTypes/DebtType";
import {CurrencyValueModel} from "../../../Data/DataModels/CurrencyValueModel";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";

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
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
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
        clearNewItems,
        getDbItemContextMenuOptions,
        checkDBItem
    } = useNewItems()

    const transactionPartners = useTransactionPartners(null)
    const categories = useCategories()
    const labels = useLabels()

    const updateDebt = (updater: (oldDebt: DebtModel) => DebtModel) => {
        setWorkDebt((current) => {
            const newDebt = new DebtModel(currentAccount?.currencyCode);
            Object.assign(newDebt, updater(current!));
            return newDebt
        })
    }

    const setNewWorkDebtUp = (debt: DebtModel, account: AccountModel) => {
        checkDebtUids(debt, account).then((debt) => {
            setWorkDebt(debt)
        })
    }

    const checkDebtUids = (debt: DebtModel, account: AccountModel): Promise<DebtModel> => {
        return new Promise<DebtModel>((resolve) => {
            const promises: Promise<any>[] = []

            clearNewItems()

            if (debt.transactionExecutorUid) {
                promises.push(
                    checkDBItem(
                        debt,
                        DatabaseRoutes.TRANSACTION_PARTNERS,
                        "transactionExecutorUid",
                        new TransactionPartnerModel(account.uid, debt.transactionExecutorFallback || "", false),
                        "newTransactionPartners"
                    )
                )
            }
            if (debt.whoHasPaidUid) {
                promises.push(
                    checkDBItem(
                        debt,
                        DatabaseRoutes.TRANSACTION_PARTNERS,
                        "whoHasPaidUid",
                        new TransactionPartnerModel(account.uid, debt.whoHasPaidFallback || "", true),
                        "newTransactionPartners"
                    )
                )
            }
            promises.push(
                checkDBItem(
                    debt,
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "whoWasPaiFor",
                    Object.fromEntries(Object.entries(debt.whoWasPaiForFallback).map(([uid, value]) => [uid, new TransactionPartnerModel(account.uid, value, true)])),
                    "newTransactionPartners"
                )
            )
            if (debt.categoryUid) {
                promises.push(
                    checkDBItem(
                        debt,
                        DatabaseRoutes.CATEGORIES,
                        "categoryUid",
                        new CategoryModel(account.uid, debt.categoryFallback || ""),
                        "newCategories"
                    )
                )
            }
            promises.push(
                checkDBItem(
                    debt,
                    DatabaseRoutes.LABELS,
                    "labels",
                    Object.fromEntries(Object.entries(debt.labelsFallback).map(([uid, value]) => [uid, new LabelModel(account.uid, value)])),
                    "newLabels"
                )
            )

            Promise.all(promises).then((result) => {
                resolve(result[0])
            })
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
        if (!currentAccount || !getDatabaseRoute) return

        if (debt && debt.uid) {
            getActiveDatabaseHelper().getDBItemOnChange(
                getDatabaseRoute(DatabaseRoutes.DEBTS),
                debt.uid,
                (changedTransaction) => {
                    changedTransaction && setNewWorkDebtUp(changedTransaction as DebtModel, currentAccount)
            })
        } else if (debt) {
            setNewWorkDebtUp(debt, currentAccount)
        } else {
            setNewWorkDebtUp(new DebtModel(currentAccount.currencyCode), currentAccount)
        }
    }, [currentAccount, getDatabaseRoute]);

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
                        distributions={workDebt.distributions}
                        onDistributionChange={(newDistributions) => {
                            updateDebt((oldDebt) => {
                                return {
                                    ...oldDebt,
                                    distributions: newDistributions
                                }
                            })
                        }}
                        currencyValue={new CurrencyValueModel(
                            workDebt.transactionAmount,
                            workDebt.currency
                        )}
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
            if (workDebt.debtType === DebtType.DEFAULT && !workDebt.name) {
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
            } else if (workDebt.debtType === DebtType.DEFAULT && !workDebt.transactionExecutorUid) {
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
            } else if (workDebt.debtType === DebtType.DEFAULT && !workDebt.categoryUid) {
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
                workDebt.whoWasPaiForFallback = Object.fromEntries(workDebt.whoWasPaiFor.map(whoWasPaidForUid => [whoWasPaidForUid, allTransactionPartners.find(tp => tp.uid === whoWasPaidForUid)?.name || ""]))
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
                workDebt.categoryFallback = [...categories, ...newItems.newCategories]?.find(category => category.uid === workDebt.categoryUid)?.name || workDebt.categoryFallback
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
                workDebt.labelsFallback = Object.fromEntries(workDebt.labels.map(labelUid => [labelUid, [...labels, ...newItems.newLabels].find(label => label.uid === labelUid)?.name || ""]))
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
            <DialogOverlay actions={(workDebt.debtType === DebtType.MONEY_TRANSFER || currentTab === 2) ? (!debt?.uid || isPreset ? [
                new ContentAction(translate("back"), () => setCurrentTab(currentTab - 1)),
                new ContentAction(translate("create"), () => {
                    setInputError(new CreateDebtInputErrorModel())

                    if (!isPreset && !validateInput()) return
                    if (!getDatabaseRoute || !currentAccount) return;

                    Promise.all(addNewValues()).then(() => {
                        if (isPreset) {
                            // getActiveDatabaseHelper().addDBItem(
                            //     getDatabaseRoute(DatabaseRoutes.PRESETS),
                            //     new DebtPresetModel(
                            //         currentAccount.uid,
                            //         presetIcon?.value!,
                            //         presetName,
                            //         workDebt,
                            //         currentAccount?.currencyCode
                            //     )
                            // ).then(() => {
                            //     dialog.closeCurrent();
                            // })
                        } else {
                            workDebt.accountUid = currentAccount.uid

                            getActiveDatabaseHelper().addDBItem(
                                getDatabaseRoute(workDebt.debtType === DebtType.DEFAULT ? DatabaseRoutes.DEBTS : DatabaseRoutes.PAYED_DEBTS),
                                workDebt
                            ).then(() => {
                                if (!preset) {
                                    dialog.closeCurrent();
                                    return
                                }

                                getActiveDatabaseHelper().updateDBItem(
                                    getDatabaseRoute(DatabaseRoutes.PRESETS),
                                    {
                                        ...preset,
                                        presetTransaction: {
                                            ...preset!.presetItem,
                                            transactionExecutorUid: preset!.presetItem.transactionExecutorUid ? workDebt.transactionExecutorUid : null,
                                            whoHasPaidUid: preset!.presetItem.whoHasPaidUid ? workDebt.whoHasPaidUid : null,
                                            whoWasPaiFor: preset!.presetItem.whoWasPaiFor ? workDebt.whoWasPaiFor : null,
                                            categoryUid: preset!.presetItem.categoryUid ? workDebt.categoryUid : null,
                                            labels: preset!.presetItem.labels.length ? workDebt.labels : [],
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

                        getActiveDatabaseHelper().updateDBItem(
                            getDatabaseRoute!(workDebt.debtType === DebtType.DEFAULT ? DatabaseRoutes.DEBTS : DatabaseRoutes.PAYED_DEBTS),
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
                { workDebt.debtType === DebtType.DEFAULT && <div className="create-transaction-dialog-navigation">
                    <div className={currentTab === 0 ? "selected" : ""}>
                        <MdAttachMoney
                            onClick={() => {
                                setCurrentTab(0)
                            }}
                        />
                        <span>{translate("basics")}</span>
                    </div>
                    <div className={currentTab === 1 ? "selected" : ""}>
                        <MdTune
                            onClick={() => {
                                setCurrentTab(1)
                            }}
                        />
                        <span>{translate("distribution")}</span>
                    </div>
                    <div className={currentTab === 2 ? "selected" : ""}>
                        <MdDescription
                            onClick={() => {
                                setCurrentTab(2)
                            }}
                        />
                        <span>{translate("description")}</span>
                    </div>
                </div>}
                {
                    getTab(currentTab)
                }
            </DialogOverlay>
        );
    }
};

export default CreateDebtDialog;