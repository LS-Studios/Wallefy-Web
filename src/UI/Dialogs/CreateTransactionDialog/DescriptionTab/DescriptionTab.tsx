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
import {InputValueIdModel} from "../../../../Data/Input/InputValueIdModel";
import {getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {getInputValueUidByUid, getInputValueUidsByUids} from "../../../../Helper/HandyFunctionHelper";

const DescriptionTab = ({
    inputError,
    workTransaction,
    updateTransaction
}: {
    inputError: CreateTransactionInputErrorModel,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {

    const [categories, setCategories] = React.useState<InputValueIdModel[] | null>([])
    const [labels, setLabels] = React.useState<InputValueIdModel[] | null>([])

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.CATEGORIES, (categories: CategoryModel[]) => {
            setCategories(categories.map(category => new InputValueIdModel(category.name, category.uid)))
        })
        getDBItemsOnChange(DatabaseRoutes.LABELS, (labels: LabelModel[]) => {
            setLabels(labels.map(label => new InputValueIdModel(label.name, label.uid)))
        })
    }, []);

    return (
        <>
            <AutoCompleteInputComponent
                title="Category of transaction"
                value={getInputValueUidByUid(workTransaction.categoryUid, categories, workTransaction.newCategory)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newCategory = value as InputValueIdModel | null;

                        if (!getInputValueUidByUid(workTransaction.categoryUid, categories)) {
                            oldTransaction.categoryUid = null;
                        }

                        if (!newCategory || newCategory.uid) {
                            oldTransaction.categoryUid = newCategory?.uid || null;
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
            />
            <AutoCompleteInputComponent
                title="Labels of transaction"
                value={getInputValueUidsByUids(workTransaction.labels, labels, workTransaction.newLabels)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newLabels = value as InputValueIdModel[];

                        const newTransactionLabels: string[] = []
                        const transactionLabels: string[] = []

                        newLabels.forEach(label => {
                            if (!label.uid) {
                                newTransactionLabels.push(label.name);
                            } else {
                                if (getInputValueUidByUid(label.uid, labels)) {
                                    transactionLabels.push(label.uid);
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