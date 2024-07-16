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
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";
import {getIcon, getIcons} from "../../../../Helper/IconMapper";
import LoadingDialog from "../../LoadingDialog/LoadingDialog";

const DescriptionTab = ({
    inputError,
    workTransaction,
    updateTransaction,
    categories,
    labels,
    newItems,
    addNewItems,
    getDbItemContextMenuOptions
}: {
    inputError: CreateTransactionInputErrorModel,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void,
    categories: CategoryModel[] | null,
    labels: LabelModel[] | null,
    newItems: CreateDialogNewItems,
    addNewItems: (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => DBItem
    getDbItemContextMenuOptions: (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => ContentAction[]
}) => {
    const { currentAccount } = useCurrentAccount();
    const translate = useTranslation()
    const dialog = useDialog()
    const getDatabaseRoute = useDatabaseRoute()

    const [categoriesForSelection, setCategoriesForSelection] = React.useState<InputNameValueModel<CategoryModel>[]>([])
    const [labelsForSelection, setLabelsForSelection] = React.useState<InputNameValueModel<LabelModel>[]>([])
    const [icons, setIcons] = React.useState<InputNameValueModel<string>[]>([])

    useEffect(() => {
        setIcons(getIcons().map((icon) => {
            return new InputNameValueModel(translate(icon), icon)
        }))
    }, []);

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

    if (!currentAccount) {
        return <LoadingDialog />
    }

    return (
        <>
            <AutoCompleteInputComponent
                title={translate("category-of-transaction")}
                value={getInputValueUidByUid(workTransaction.categoryUid, categoriesForSelection)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newCategory = value as InputNameValueModel<CategoryModel> | null;

                        if (newCategory) {
                            if (newCategory.value) {
                                oldTransaction.categoryUid = newCategory.value.uid
                            } else {
                                oldTransaction.categoryUid = addNewItems(
                                    new CategoryModel(
                                        currentAccount.uid,
                                        newCategory.name,
                                    ),
                                    "newCategories"
                                ).uid
                            }
                        } else {
                            oldTransaction.categoryUid = null;
                        }

                        return oldTransaction;
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
            <AutoCompleteInputComponent<string>
                title={translate("icon")}
                value={workTransaction.icon ? new InputNameValueModel(translate(workTransaction.icon || ""), workTransaction.icon) : null}
                Icon={workTransaction.icon ? getIcon(workTransaction.icon || "") : null}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.icon = (value as InputNameValueModel<string> | null)?.value || null;
                        return oldTransaction;
                    });
                }}
                suggestionUlStyle={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                    gap: "10px"
                }}
                suggestionElement={(suggestion) => {
                    const Icon = getIcon(suggestion.value!) as React.FC
                    return <div className="create-transaction-preset-icon">
                        <Icon />
                        <span>{suggestion.name}</span>
                    </div>
                }}
                suggestions={icons}
            />
            <AutoCompleteInputComponent
                title={translate("labels-of-transaction")}
                value={getInputValueUidsByUids(workTransaction.labels, labelsForSelection)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newLabels = value as InputNameValueModel<LabelModel>[];

                        oldTransaction.labels = newLabels?.map(label => {
                            return label.value?.uid || addNewItems(
                                new LabelModel(
                                    currentAccount!.uid,
                                    label.name
                                ),
                                'newLabels'
                            ).uid
                        }) || [];

                        return oldTransaction;
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