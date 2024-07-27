import React, {useEffect} from 'react';
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import TextAreaInputComponent from "../../../Components/Input/TextAreaInput/TextAreaInputComponent";
import {CategoryModel} from "../../../../Data/DatabaseModels/CategoryModel";
import {LabelModel} from "../../../../Data/DatabaseModels/LabelModel";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {getInputValueUidByUid, getInputValueUidsByUids} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../../Providers/DialogProvider";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useAccountRoute} from "../../../../CustomHooks/Database/useAccountRoute";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {CreateDebtInputErrorModel} from "../../../../Data/ErrorModels/CreateDebtInputErrorModel";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";
import {getIcon, getIcons} from "../../../../Helper/IconMapper";
import LoadingDialog from "../../LoadingDialog/LoadingDialog";

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
    const { currentAccount } = useCurrentAccount();
    const translate = useTranslation()
    const dialog = useDialog()
    const getDatabaseRoute = useAccountRoute()

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
                    borderColor: inputError.categoryError ? "var(--error-color)" : "null"
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
                value={workDebt.icon ? new InputNameValueModel(translate(workDebt.icon || ""), workDebt.icon) : null}
                Icon={workDebt.icon ? getIcon(workDebt.icon || "") : null}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.icon = (value as InputNameValueModel<string> | null)?.value || null;
                        return oldDebt;
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
                value={getInputValueUidsByUids(workDebt.labels || [], labelsForSelection)}
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