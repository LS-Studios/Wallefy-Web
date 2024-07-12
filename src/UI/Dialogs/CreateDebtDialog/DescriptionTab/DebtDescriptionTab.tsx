import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {TransactionType} from "../../../../Data/EnumTypes/TransactionType";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";
import TextAreaInputComponent from "../../../Components/Input/TextAreaInput/TextAreaInputComponent";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {CreateTransactionInputErrorModel} from "../../../../Data/ErrorModels/CreateTransactionInputErrorModel";
import {CategoryModel} from "../../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../../Data/DatabaseModels/LabelModel";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {deleteDBItemByUid, getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {
    getInputValueUidByUid,
    getInputValueUidsByUids
} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import EditStorageItemDialog from "../../EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../../../../Data/DatabaseModels/StorageItemModel";
import {useDialog} from "../../../../Providers/DialogProvider";
import useEffectNotInitial from "../../../../CustomHooks/useEffectNotInitial";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {CreateDebtInputErrorModel} from "../../../../Data/ErrorModels/CreateDebtInputErrorModel";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";

const DebtDescriptionTab = ({
    inputError,
    workDebt,
    updateDebt,
    categories,
    labels,
    newItems,
    addNewItems,
    getDbItemContextMenuOptions
}: {
    inputError: CreateDebtInputErrorModel,
    workDebt: DebtModel,
    updateDebt: (updater: (oldDebt: DebtModel) => DebtModel) => void,
    categories: CategoryModel[] | null,
    labels: LabelModel[] | null,
    newItems: CreateDialogNewItems,
    addNewItems: (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => DBItem
    getDbItemContextMenuOptions: (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => ContentAction[]
}) => {
    const currentAccount = useCurrentAccount()
    const translate = useTranslation()
    const dialog = useDialog()
    const getDatabaseRoute = useDatabaseRoute()

    const [categoriesForSelection, setCategoriesForSelection] = React.useState<InputNameValueModel<CategoryModel>[]>([])
    const [labelsForSelection, setLabelsForSelection] = React.useState<InputNameValueModel<LabelModel>[]>([])

    useEffect(() => {
        if (categories) {
            const categoriesForSelection = categories.map(category => new InputNameValueModel(category.name, category))
            const newCategoriesForSelection = newItems.newCategories.map(category => new InputNameValueModel(category.name, category))
            setCategoriesForSelection([...categoriesForSelection, ...newCategoriesForSelection])
        }
    }, [categories, newItems.newCategories])

    useEffect(() => {
        if (labels) {
            const labelsForSelection = labels.map(label => new InputNameValueModel(label.name, label))
            const newLabelsForSelection = newItems.newLabels.map(label => new InputNameValueModel(label.name, label))
            setLabelsForSelection([...labelsForSelection, ...newLabelsForSelection])
        }
    }, [labels, newItems.newLabels])

    return (
        <>
            <AutoCompleteInputComponent
                title={translate("category-of-transaction")}
                value={getInputValueUidByUid(workDebt.categoryUid, categoriesForSelection)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const selectedCategory = value as InputNameValueModel<CategoryModel> | null;

                        if (selectedCategory) {
                            if (selectedCategory.value) {
                                oldDebt.categoryUid = selectedCategory.value.uid
                            } else {
                                oldDebt.categoryUid = addNewItems(
                                    new CategoryModel(
                                        currentAccount!.uid,
                                        selectedCategory.name,
                                    ),
                                    "newCategories"
                                ).uid
                            }
                        } else {
                            oldDebt.categoryUid = null;
                        }

                        return oldDebt;
                    });
                }}
                suggestions={categoriesForSelection}
                style={{
                    borderColor: inputError.categoryError ? variables.error_color : null
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.CATEGORIES,
                    'newCategories',
                    value
                )}
            />
            <AutoCompleteInputComponent
                title={translate("labels-of-transaction")}
                value={getInputValueUidsByUids(workDebt.labels, labelsForSelection)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const newLabels = value as InputNameValueModel<LabelModel>[];

                        oldDebt.labels = newLabels?.map(label => {
                            return label.value?.uid || addNewItems(
                                new LabelModel(
                                    currentAccount!.uid,
                                    label.name
                                ),
                                'newLabels'
                            ).uid
                        }) || [];

                        return oldDebt;
                    });
                }}
                suggestions={labelsForSelection}
                placeholder={translate("add-label")}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.LABELS,
                    'newLabels',
                    value
                )}
            />
            <TextAreaInputComponent
                title={translate("notes")}
                value={workDebt.notes}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.notes = value as string;
                        return oldDebt;
                    });
                }}
            />
        </>
    );
};

export default DebtDescriptionTab;