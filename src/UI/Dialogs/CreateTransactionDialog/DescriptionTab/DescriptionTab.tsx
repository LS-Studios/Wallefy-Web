import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/Input/InputOptionModel";
import {TransactionType} from "../../../../Data/Transactions/TransactionType";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";
import TextAreaInputComponent from "../../../Components/Input/TextAreaInput/TextAreaInputComponent";
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import {CreateTransactionInputErrorModel} from "../../../../Data/CreateScreen/CreateTransactionInputErrorModel";
import {CategoryModel} from "../../../../Data/CategoryModel";
import {LabelModel} from "../../../../Data/LabelModel";
import {InputNameValueModel} from "../../../../Data/Input/InputNameValueModel";
import {deleteDBItemByUid, getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {getInputValueUidByUid, getInputValueUidsByUids} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import EditStorageItemDialog from "../../EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../../../../Data/StorageItemModel";
import {useDialog} from "../../../../Providers/DialogProvider";

const DescriptionTab = ({
    inputError,
    workTransaction,
    updateTransaction
}: {
    inputError: CreateTransactionInputErrorModel,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {
    const dialog = useDialog()

    const [categories, setCategories] = React.useState<InputNameValueModel<CategoryModel>[] | null>([])
    const [labels, setLabels] = React.useState<InputNameValueModel<LabelModel>[] | null>([])

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.CATEGORIES, (categories: CategoryModel[]) => {
            setCategories(categories.map(category => new InputNameValueModel(category.name, category)))
        })
        getDBItemsOnChange(DatabaseRoutes.LABELS, (labels: LabelModel[]) => {
            setLabels(labels.map(label => new InputNameValueModel(label.name, label)))
        })
    }, []);

    return (
        <>
            <AutoCompleteInputComponent
                title="Category of transaction"
                value={getInputValueUidByUid(workTransaction.categoryUid, categories, workTransaction.newCategory)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newCategory = value as InputNameValueModel<CategoryModel> | null;

                        if (!getInputValueUidByUid(workTransaction.categoryUid, categories)) {
                            oldTransaction.categoryUid = null;
                        }

                        if (!newCategory || newCategory.value) {
                            oldTransaction.categoryUid = newCategory?.value?.uid || null;
                            oldTransaction.newCategory = null
                        } else {
                            oldTransaction.newCategory = newCategory.name;
                        }

                        return oldTransaction;
                    });
                }}
                suggestions={categories}
                style={{
                    borderColor: inputError.categoryError ? variables.errorColor : null
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => [
                    new ContentAction(
                        "Edit",
                        () => {
                            dialog.open(
                                new DialogModel(
                                    "Edit Category",
                                    <EditStorageItemDialog
                                        storageItem={new StorageItemModel(value.value!, DatabaseRoutes.CATEGORIES)}
                                    />
                                )
                            )
                        }
                    ),
                    new ContentAction(
                        "Delete",
                        () => {
                            deleteDBItemByUid(DatabaseRoutes.CATEGORIES, value.value!.uid)
                        }
                    )
                ]}
            />
            <AutoCompleteInputComponent
                title="Labels of transaction"
                value={getInputValueUidsByUids(workTransaction.labels, labels, workTransaction.newLabels)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newLabels = value as InputNameValueModel<LabelModel>[];

                        const newTransactionLabels: string[] = []
                        const transactionLabels: string[] = []

                        newLabels.forEach(label => {
                            if (!label.value) {
                                newTransactionLabels.push(label.name);
                            } else {
                                if (getInputValueUidByUid(label.value.uid, labels)) {
                                    transactionLabels.push(label.value.uid);
                                }
                            }
                        })

                        oldTransaction.newLabels = newTransactionLabels;
                        oldTransaction.labels = transactionLabels;

                        return oldTransaction;
                    });
                }}
                suggestions={labels}
                placeholder="Add label..."
                allowCreatingNew={true}
                contextMenuOptions={(value) => [
                    new ContentAction(
                        "Edit",
                        () => {
                            dialog.open(
                                new DialogModel(
                                    "Edit Label",
                                    <EditStorageItemDialog
                                        storageItem={new StorageItemModel(value.value!, DatabaseRoutes.LABELS)}
                                    />
                                )
                            )
                        }
                    ),
                    new ContentAction(
                        "Delete",
                        () => {
                            deleteDBItemByUid(DatabaseRoutes.LABELS, value.value!.uid)
                        }
                    )
                ]}
            />
            <TextAreaInputComponent
                title="Notes"
                value={workTransaction.notes}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.notes = value as string;
                        return oldTransaction;
                    });
                }}
            />
        </>
    );
};

export default DescriptionTab;