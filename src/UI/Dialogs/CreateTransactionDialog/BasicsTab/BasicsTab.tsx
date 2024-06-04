import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/Input/InputOptionModel";
import {TransactionType} from "../../../../Data/Transactions/TransactionType";
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import * as MDIcons from "react-icons/md";
import {CreateTransactionInputErrorModel} from "../../../../Data/CreateScreen/CreateTransactionInputErrorModel";
import {TransactionPartnerModel} from "../../../../Data/TransactionPartnerModel";
import {deleteDBItemByUid, getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../../Data/Input/InputNameValueModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import EditStorageItemDialog from "../../EditStorageItemDialog/EditStorageItemDialog";
import {StorageItemModel} from "../../../../Data/StorageItemModel";

const BasicsTab = ({
   inputError,
   isPreset,
   presetIcon,
   setPresetIcon,
   presetName,
   setPresetName,
   workTransaction,
   updateTransaction,
}: {
    inputError: CreateTransactionInputErrorModel,
    isPreset: boolean,
    presetIcon: InputNameValueModel<string> | null,
    setPresetIcon: (value: InputNameValueModel<string> | null) => void,
    presetName: string,
    setPresetName: (value: string) => void,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {
    const dialog = useDialog()

    const transactionTypeInputOptions = [
        new InputOptionModel("Income", TransactionType.INCOME),
        new InputOptionModel("Expense", TransactionType.EXPENSE)
    ];

    const [transactionPartners, setTransactionPartners] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, (partners: TransactionPartnerModel[]) => {
            setTransactionPartners(partners.map(partner => new InputNameValueModel<TransactionPartnerModel>(partner.name, partner)))
        })
    }, []);

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
                    title="Preset name"
                    value={presetName}
                    onValueChange={(value) => {
                        setPresetName(value as string);
                    }}
                />
            </> }
            <TextInputComponent
                title="Name of transaction"
                value={workTransaction.name}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.name = value as string;
                        return oldTransaction;
                    });
                }}
                style={{
                    borderColor: inputError.nameError ? variables.errorColor : null
                }}
            />
            <RadioInputComponent
                title="Transaction type"
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
                title="Transaction amount"
                value={workTransaction.transactionAmount}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        oldTransaction.transactionAmount = value;
                        return oldTransaction;
                    });
                }}
                style={{
                    borderColor: inputError.transactionAmountError ? variables.errorColor : null
                }}
            />
            <AutoCompleteInputComponent
                title={(workTransaction.transactionType === TransactionType.INCOME ? "Sender" : "Receiver") + " of transaction"}
                value={getInputValueUidByUid(workTransaction.transactionExecutorUid, transactionPartners, workTransaction.newTransactionPartner)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newTransactionExecutor = value as InputNameValueModel<TransactionPartnerModel> | null;

                        if (!getInputValueUidByUid(workTransaction.transactionExecutorUid, transactionPartners)) {
                            oldTransaction.transactionExecutorUid = null;
                        }

                        if (!newTransactionExecutor || newTransactionExecutor.value) {
                            oldTransaction.transactionExecutorUid = newTransactionExecutor?.value?.uid || null;
                            oldTransaction.newTransactionPartner = null;
                        } else {
                            oldTransaction.newTransactionPartner = newTransactionExecutor.name;
                        }

                        return oldTransaction;
                    });
                }}
                suggestions={transactionPartners}
                style={{
                    borderColor: inputError.transactionPartnerError ? variables.errorColor : null
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => [
                    new ContentAction(
                        "Edit",
                        () => {
                            dialog.open(
                                new DialogModel(
                                    "Edit Transaction Partner",
                                    <EditStorageItemDialog
                                        storageItem={new StorageItemModel(value.value!, DatabaseRoutes.TRANSACTION_PARTNERS)}
                                    />
                                )
                            )
                        }
                    ),
                    new ContentAction(
                        "Delete",
                        () => {
                            deleteDBItemByUid(DatabaseRoutes.TRANSACTION_PARTNERS, value.value!.uid)
                        }
                    )
                ]}
            />
        </>
    );
};

export default BasicsTab;