import React, {useEffect} from 'react';
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import './CreateTransactionDialog.scss';

// @ts-ignore
import variables from "../../../Data/Variables.scss";
import {MdAttachMoney, MdDescription, MdRepeat} from "react-icons/md";
import RadioInputComponent from "../../Components/Input/RadioInput/RadioInputComponent";
import {TransactionType} from "../../../Data/Transactions/TransactionType";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import CurrencyInputComponent from "../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import BasicsTab from "./BasicsTab/BasicsTab";
import RepetitionTab from "./RepetitionTab/RepetitionTab";
import DescriptionTab from "./DescriptionTab/DescriptionTab";
import {useDialog} from "../../../Providers/DialogProvider";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {
    addDBItem,
    getDBItemByUid, getDBItemOnChange,
    getDBItemsOnChange,
    updateDBItem
} from "../../../Helper/AceBaseHelper";
import {TransactionPresetModel} from "../../../Data/CreateScreen/TransactionPresetModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {CreateTransactionInputErrorModel} from "../../../Data/CreateScreen/CreateTransactionInputErrorModel";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../Data/Input/InputNameValueModel";
import {CategoryModel} from "../../../Data/CategoryModel";
import {LabelModel} from "../../../Data/LabelModel";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import structuredClone from '@ungap/structured-clone';

const CreateTransactionDialog = ({
    transaction,
    isPreset = false,
    preset
 }: {
    transaction?: TransactionModel,
    isPreset?: boolean,
    preset?: TransactionPresetModel,
}) => {
    const dialog = useDialog()
    const toast = useToast()

    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [presetIcon, setPresetIcon] = React.useState<InputNameValueModel<string> | null>(null)
    const [presetName, setPresetName] = React.useState<string>("")

    const [workTransaction, setWorkTransaction] = React.useState<TransactionModel>(new TransactionModel())
    const [inputError, setInputError] = React.useState<CreateTransactionInputErrorModel>(new CreateTransactionInputErrorModel())

    const [labels, setLabels] = React.useState<LabelModel[]>([])

    const updateTransaction = (updater: (oldTransaction: TransactionModel) => TransactionModel) => {
        setWorkTransaction((current) => {
            const newTransaction = new TransactionModel();
            Object.assign(newTransaction, updater(current));
            return newTransaction
        })
    }

    const getTab = (tab: number) => {
        switch (tab) {
            case 0:
                return <BasicsTab
                    inputError={inputError}
                    isPreset={isPreset}
                    presetIcon={presetIcon}
                    setPresetIcon={setPresetIcon}
                    presetName={presetName}
                    setPresetName={setPresetName}
                    workTransaction={workTransaction}
                    updateTransaction={updateTransaction}
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
                />
        }
    }

    const validateInput = () => {
        if (!workTransaction.name) {
            toast.open("Please enter a transaction name!")
            setInputError((old) => {
                old.nameError = true;
                return old
            })
            setCurrentTab(0)
            return false
        } else if (!workTransaction.transactionAmount) {
            toast.open("Please enter an transaction amount!")
            setInputError((old) => {
                old.transactionAmountError = true;
                return old
            })
            setCurrentTab(0)
            return false
        } else if (!workTransaction.transactionExecutorUid && !workTransaction.newTransactionPartner) {
            toast.open("Please enter a transaction partner!")
            setInputError((old) => {
                old.transactionPartnerError = true;
                return old
            })
            setCurrentTab(0)
            return false
        } else if (!workTransaction.categoryUid && !workTransaction.newCategory) {
            toast.open("Please enter a category!")
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

        if (!workTransaction.transactionExecutorUid && workTransaction.newTransactionPartner) {
            promises.push(
                addDBItem(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    new TransactionPartnerModel(workTransaction.newTransactionPartner, false)
                ).then((newTransactionPartner) => {
                    workTransaction.transactionExecutorUid = newTransactionPartner.uid
                })
            )
        }

        if (!workTransaction.categoryUid && workTransaction.newCategory) {
            promises.push(
                addDBItem(
                    DatabaseRoutes.CATEGORIES,
                    new CategoryModel(workTransaction.newCategory)
                ).then((newCategory) => {
                    workTransaction.categoryUid = newCategory.uid
                })
            )
        }

        const newLabels = workTransaction.newLabels.filter((newLabel) => !labels.map(label => label.name).includes(newLabel))
        newLabels.forEach(label => {
            promises.push(
                addDBItem(DatabaseRoutes.LABELS, new LabelModel(label)).then((newLabel) => {
                    workTransaction.labels.push(newLabel.uid)
                })
            )
        })
        return promises
    }

    useEffect(() => {
        if (transaction) {
            getDBItemOnChange(DatabaseRoutes.TRANSACTIONS, transaction.uid, (changedTransaction) => {
                setWorkTransaction(changedTransaction as TransactionModel)
            })
        }

        getDBItemsOnChange(DatabaseRoutes.LABELS, setLabels)
    }, []);

    useEffect(() => {
        if (workTransaction.transactionExecutorUid) {
            getDBItemByUid(DatabaseRoutes.TRANSACTION_PARTNERS, workTransaction.transactionExecutorUid).then((partner) => {
                if (!partner) {
                    setWorkTransaction((oldTransaction) => {
                        oldTransaction.transactionExecutorUid = null
                        return oldTransaction
                    })
                }
            })
        }
        if (workTransaction.categoryUid) {
            getDBItemByUid(DatabaseRoutes.CATEGORIES, workTransaction.categoryUid).then((category) => {
                if (!category) {
                    setWorkTransaction((oldTransaction) => {
                        oldTransaction.categoryUid = null
                        return oldTransaction
                    })
                }
            })
        }
        workTransaction.labels.forEach((labelUid) => {
            getDBItemByUid(DatabaseRoutes.LABELS, labelUid).then((label) => {
                if (!label) {
                    setWorkTransaction((oldTransaction) => {
                        oldTransaction.labels = oldTransaction.labels.filter((uid) => uid !== labelUid)
                        return oldTransaction
                    })
                }
            })
        })
    }, [workTransaction]);

    return (
        <DialogOverlay actions={currentTab === 2 ? (!transaction?.uid || isPreset ? [
            new ContentAction("Back", () => setCurrentTab(currentTab - 1)),
            new ContentAction("Create", () => {
                setInputError(new CreateTransactionInputErrorModel())

                if (!isPreset && !validateInput()) return

                Promise.all(addNewValues()).then(() => {
                    if (isPreset) {
                        addDBItem(DatabaseRoutes.PRESETS, new TransactionPresetModel(
                            presetIcon?.value!,
                            presetName,
                            workTransaction
                        )).then(() => {
                            dialog.closeCurrent();
                        })
                    } else {
                        workTransaction.newTransactionPartner = null
                        workTransaction.newCategory = null
                        workTransaction.newLabels = []

                        addDBItem(DatabaseRoutes.TRANSACTIONS, workTransaction).then(() => {
                            if (!preset) {
                                dialog.closeCurrent();
                                return
                            }

                            updateDBItem(DatabaseRoutes.PRESETS, {
                                ...preset,
                                presetTransaction: {
                                    ...preset!.presetTransaction,
                                    transactionExecutorUid: preset!.presetTransaction.transactionExecutorUid ? workTransaction.transactionExecutorUid : null,
                                    categoryUid: preset!.presetTransaction.categoryUid ? workTransaction.categoryUid : null,
                                    labels: preset!.presetTransaction.labels.length ? workTransaction.labels : [],
                                } as TransactionModel
                            } as TransactionPresetModel).then(() => {
                                dialog.closeCurrent();
                            })
                        })
                    }
                })
            }),
        ] : [
            new ContentAction("Back", () => setCurrentTab(currentTab - 1)),
            new ContentAction("Edit", () => {
                if (!validateInput()) return

                Promise.all(addNewValues()).then(() => {
                    workTransaction.newTransactionPartner = null
                    workTransaction.newCategory = null
                    workTransaction.newLabels = []

                    updateDBItem(DatabaseRoutes.TRANSACTIONS, workTransaction).then(() => {
                        dialog.closeCurrent();
                    })
                })
            })
        ]) : [
            new ContentAction("Back", () => setCurrentTab(currentTab - 1), currentTab === 0),
            new ContentAction("Next", () => setCurrentTab(currentTab + 1)),
        ]}>
            <div className="create-transaction-dialog-navigation">
                <div>
                    <MdAttachMoney
                        className={currentTab === 0 ? "selected" : ""}
                        onClick={() => { setCurrentTab(0) }}
                    />
                    <span>Basics</span>
                </div>
                <div>
                    <MdRepeat
                        className={currentTab === 1 ? "selected" : ""}
                        onClick={() => { setCurrentTab(1) }}
                    />
                    <span>Repetition</span>
                </div>
                <div>
                    <MdDescription
                        className={currentTab === 2 ? "selected" : ""}
                        onClick={() => { setCurrentTab(2) }}
                    />
                    <span>Description</span>
                </div>
            </div>
            {
                getTab(currentTab)
            }
        </DialogOverlay>
    );
};

export default CreateTransactionDialog;