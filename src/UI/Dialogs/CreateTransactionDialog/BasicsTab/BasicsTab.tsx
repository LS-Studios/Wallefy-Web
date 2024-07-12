import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {TransactionType} from "../../../../Data/EnumTypes/TransactionType";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import * as MDIcons from "react-icons/md";
import {CreateTransactionInputErrorModel} from "../../../../Data/ErrorModels/CreateTransactionInputErrorModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {deleteDBItemByUid, getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import EditStorageItemDialog from "../../EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../../../../Data/DatabaseModels/StorageItemModel";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";

const BasicsTab = ({
   inputError,
   isPreset,
   presetIcon,
   setPresetIcon,
   presetName,
   setPresetName,
   workTransaction,
   updateTransaction,
   transactionPartners,
   newItems,
   addNewItems,
   getDbItemContextMenuOptions
}: {
    inputError: CreateTransactionInputErrorModel,
    isPreset: boolean,
    presetIcon: InputNameValueModel<string> | null,
    setPresetIcon: (value: InputNameValueModel<string> | null) => void,
    presetName: string,
    setPresetName: (value: string) => void,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void,
    transactionPartners: TransactionPartnerModel[] | null,
    newItems: CreateDialogNewItems,
    addNewItems: (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => DBItem
    getDbItemContextMenuOptions: (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => ContentAction[]
}) => {
    const translate = useTranslation()

    const transactionTypeInputOptions = [
        new InputOptionModel(translate("income"), TransactionType.INCOME),
        new InputOptionModel(translate("expenses"), TransactionType.EXPENSE)
    ];

    const [transactionPartnersForSelection, setTransactionPartnersForSelection] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)

    useEffect(() => {
        if (transactionPartners) {
            const transactionPartnersForSelection = transactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            const newTransactionPartnersForSelection = newItems.newTransactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            setTransactionPartnersForSelection([...transactionPartnersForSelection, ...newTransactionPartnersForSelection])
        }
    }, [transactionPartners, newItems.newTransactionPartners]);

    return (
        <>
            { isPreset && <>
                <AutoCompleteInputComponent<string>
                    title="Preset icon"
                    value={presetIcon}
                    onValueChange={(value) => {
                        setPresetIcon(value as InputNameValueModel<string> | null);
                    }}
                    // valueFormatter={(value) => {
                    //     return value.slice(2).replace(/([A-Z])/g, ' $1').trim();
                    // }}
                    suggestionUlStyle={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px"
                    }}
                    suggestionElement={(suggestion) => {
                        const Icon = (MDIcons as any)[suggestion.value!]
                        return <div className="create-transaction-preset-icon">
                            <Icon />
                            <span>{suggestion.name}</span>
                        </div>
                    }}
                    fetchSuggestionsOnOpen={() => {
                        return new Promise<InputNameValueModel<string>[]>((resolve) => {
                            const icons = Object.keys(MDIcons).map((icon) => {
                                return new InputNameValueModel(icon.slice(2).replace(/([A-Z])/g, ' $1').trim(), icon)
                            })
                            resolve(icons)
                        })
                    }}
                />
                <TextInputComponent
                    title={translate("preset-name")}
                    value={presetName}
                    onValueChange={(value) => {
                        setPresetName(value as string);
                    }}
                />
            </> }
            <TextInputComponent
                title={translate("name-of-transaction")}
                value={workTransaction.name}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.name = value as string;
                        return oldTransaction;
                    });
                }}
                style={{
                    borderColor: inputError.nameError ? variables.error_color : null
                }}
            />
            <RadioInputComponent
                title={translate("transaction-type")}
                value={transactionTypeInputOptions.find(option => option.value === workTransaction.transactionType)!}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.transactionType = (value as InputOptionModel<TransactionType>).value;
                        return oldTransaction;
                    });
                }}
                options={transactionTypeInputOptions}
            />
            <CurrencyInputComponent
                title={translate("transaction-amount")}
                value={workTransaction.transactionAmount}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.transactionAmount = value;
                        return oldTransaction;
                    });
                }}
                currency={workTransaction.currency}
                onCurrencyChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.currency = value;
                        return oldTransaction;
                    });
                }}
                style={{
                    borderColor: inputError.transactionAmountError ? variables.error_color : null
                }}
            />
            <AutoCompleteInputComponent
                title={(workTransaction.transactionType === TransactionType.INCOME ? translate("sender-of-transaction") : translate("receiver-of-transaction"))}
                value={getInputValueUidByUid(workTransaction.transactionExecutorUid, transactionPartnersForSelection)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newTransactionExecutor = value as InputNameValueModel<TransactionPartnerModel> | null;

                        if (newTransactionExecutor) {
                            if (newTransactionExecutor.value) {
                                oldTransaction.transactionExecutorUid = newTransactionExecutor.value.uid
                            } else {
                                const newTransactionPartner = new TransactionPartnerModel(
                                    oldTransaction!.uid,
                                    newTransactionExecutor.name,
                                    false
                                )

                                oldTransaction.transactionExecutorUid = addNewItems(newTransactionPartner, "newTransactionPartners").uid
                            }
                        } else {
                            oldTransaction.transactionExecutorUid = null;
                        }

                        return oldTransaction;
                    });
                }}
                suggestions={transactionPartnersForSelection}
                style={{
                    borderColor: inputError.transactionPartnerError ? variables.error_color : null
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "newTransactionPartners",
                    value
                )}
            />
        </>
    );
};

export default BasicsTab;