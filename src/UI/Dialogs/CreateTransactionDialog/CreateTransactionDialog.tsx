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
import {Route, Routes} from "react-router-dom";
import RepetitionTab from "./RepetitionTab/RepetitionTab";
import DescriptionTab from "./DescriptionTab/DescriptionTab";
import {useDialog} from "../../../Providers/DialogProvider";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {addDBItem, updateDBItem} from "../../../Helper/AceBaseHelper";
import {TransactionPresetModel} from "../../../Data/CreateScreen/TransactionPresetModel";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {CreateTransactionInputErrorModel} from "../../../Data/CreateScreen/CreateTransactionInputErrorModel";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {InputValueIdModel} from "../../../Data/Input/InputValueIdModel";
import {CategoryModel} from "../../../Data/CategoryModel";
import {LabelModel} from "../../../Data/LabelModel";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";

const CreateTransactionDialog = ({
    transaction,
    isPreset = false
 }: {
    transaction?: TransactionModel,
    isPreset?: boolean
}) => {
    const dialog = useDialog()
    const toast = useToast()

    const [currentTab, setCurrentTab] = React.useState<number>(0);
    const [presetIcon, setPresetIcon] = React.useState<InputValueIdModel | null>(null)
    const [workTransaction, setWorkTransaction] = React.useState<TransactionModel>(transaction || new TransactionModel())
    const [inputError, setInputError] = React.useState<CreateTransactionInputErrorModel>(new CreateTransactionInputErrorModel())

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

        if (workTransaction.newTransactionPartner) {
            promises.push(
                addDBItem(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    new TransactionPartnerModel(workTransaction.newTransactionPartner, false)
                ).then((newTransactionPartner) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.transactionExecutorUid = newTransactionPartner.uid
                        return oldTransaction
                    })
                })
            )
        }

        if (workTransaction.newCategory) {
            promises.push(
                addDBItem(
                    DatabaseRoutes.CATEGORIES,
                    new CategoryModel(workTransaction.newCategory)
                ).then((newCategory) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.categoryUid = newCategory.uid
                        return oldTransaction
                    })
                })
            )
        }

        if (workTransaction.newLabels.length > 0) {
            workTransaction.newLabels.forEach(label => {
                promises.push(
                    addDBItem(DatabaseRoutes.LABELS, new LabelModel(label)).then((newLabel) => {
                        updateTransaction((oldTransaction) => {
                            oldTransaction.labels.push(newLabel.uid)
                            return oldTransaction
                        })
                    })
                )
            })
        }

        return promises
    }

    return (
        <DialogOverlay actions={currentTab === 2 ? (!transaction?.uid || isPreset ? [
            new ContentAction("Back", () => setCurrentTab(currentTab - 1)),
            new ContentAction("Create", () => {
                setInputError(new CreateTransactionInputErrorModel())

                if (isPreset) {
                    addDBItem(DatabaseRoutes.CUSTOM_PRESETS, new TransactionPresetModel(
                        presetIcon?.uid!,
                        workTransaction
                    )).then(() => {
                        dialog.closeCurrent();
                    })
                } else {
                    if (!validateInput()) return

                    Promise.all(addNewValues()).then(() => {
                        workTransaction.newCategory = null
                        workTransaction.newCategory = null
                        workTransaction.newLabels = []

                        addDBItem(DatabaseRoutes.TRANSACTIONS, workTransaction).then(() => {
                            dialog.closeCurrent();
                        })
                    })
                }
            }),
        ] : [
            new ContentAction("Back", () => setCurrentTab(currentTab - 1)),
            new ContentAction("Edit", () => {
                if (!validateInput()) return

                Promise.all(addNewValues()).then(() => {
                    workTransaction.newTransactionPartner = null
                    workTransaction.newCategory = null
                    workTransaction.newLabels = []

                    console.log(workTransaction.transactionExecutorUid)

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