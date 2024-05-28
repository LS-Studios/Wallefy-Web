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
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import {TransactionPresetModel} from "../../../../Data/CreateScreen/TransactionPresetModel";
import * as MDIcons from "react-icons/md";
import {CreateTransactionInputErrorModel} from "../../../../Data/CreateScreen/CreateTransactionInputErrorModel";
import {TransactionPartnerModel} from "../../../../Data/TransactionPartnerModel";
import {deleteDBItemByUid, getDBItemsOnChange} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {InputValueIdModel} from "../../../../Data/Input/InputValueIdModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";

const BasicsTab = ({
   inputError,
   isPreset,
   presetIcon,
   setPresetIcon,
   workTransaction,
   updateTransaction,
}: {
    inputError: CreateTransactionInputErrorModel,
    isPreset: boolean,
    presetIcon: InputValueIdModel | null,
    setPresetIcon: (value: InputValueIdModel | null) => void,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {
    const transactionTypeInputOptions = [
        new InputOptionModel("Income", TransactionType.INCOME),
        new InputOptionModel("Expense", TransactionType.EXPENSE)
    ];

    const [transactionPartners, setTransactionPartners] = React.useState<InputValueIdModel[] | null>(null)

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, (partners: TransactionPartnerModel[]) => {
            setTransactionPartners(partners.map(partner => new InputValueIdModel(partner.name, partner.uid)))
        })
    }, []);

    return (
        <>
            { isPreset && <>
                <AutoCompleteInputComponent
                    title="Preset icon"
                    value={presetIcon}
                    onValueChange={(value) => {
                        setPresetIcon(value as InputValueIdModel | null);
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
                        const Icon = (MDIcons as any)[suggestion.uid!]
                        return <div className="create-transaction-preset-icon">
                            <Icon />
                            <span>{suggestion.name}</span>
                        </div>
                    }}
                    suggestions={Object.keys(MDIcons).map((icon) => {
                        return new InputValueIdModel(icon.slice(2).replace(/([A-Z])/g, ' $1').trim(), icon)
                    })}
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
                title="StorageItem type"
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
                title="StorageItem amount"
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
                title="Sender of transaction"
                value={getInputValueUidByUid(workTransaction.transactionExecutorUid, transactionPartners, workTransaction.newTransactionPartner)}
                onValueChange={(value) => {
                    updateTransaction((oldTransaction) => {
                        const newTransactionExecutor = value as InputValueIdModel | null;

                        if (!getInputValueUidByUid(workTransaction.transactionExecutorUid, transactionPartners)) {
                            oldTransaction.transactionExecutorUid = null;
                        }

                        if (!newTransactionExecutor || newTransactionExecutor.uid) {
                            oldTransaction.transactionExecutorUid = newTransactionExecutor?.uid || null;
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
                onDelete={(value) => {
                    deleteDBItemByUid(DatabaseRoutes.TRANSACTION_PARTNERS, value.uid!)
                }}
            />
        </>
    );
};

export default BasicsTab;