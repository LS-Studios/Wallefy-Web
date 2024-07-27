import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {TransactionType} from "../../../../Data/EnumTypes/TransactionType";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {CreateTransactionInputErrorModel} from "../../../../Data/ErrorModels/CreateTransactionInputErrorModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {getInputValueUidByUid} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";
import {getIcon, getIcons} from "../../../../Helper/IconMapper";
import LoadingDialog from "../../LoadingDialog/LoadingDialog";

const BasicsTab = ({
   inputError,
   workTransaction,
   updateTransaction,
   transactionPartners,
   newItems,
   addNewItems,
   getDbItemContextMenuOptions
}: {
    inputError: CreateTransactionInputErrorModel,
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void,
    transactionPartners: TransactionPartnerModel[] | null,
    newItems: CreateDialogNewItems,
    addNewItems: (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => DBItem
    getDbItemContextMenuOptions: (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => ContentAction[]
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount()

    const transactionTypeInputOptions = [
        new InputOptionModel(translate("income"), TransactionType.INCOME),
        new InputOptionModel(translate("expenses"), TransactionType.EXPENSE)
    ];

    const [transactionPartnersForSelection, setTransactionPartnersForSelection] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)
    const [icons, setIcons] = React.useState<InputNameValueModel<string>[]>([])

    useEffect(() => {
        setIcons(getIcons().map((icon) => {
            return new InputNameValueModel(translate(icon), icon)
        }))
    }, []);

    useEffect(() => {
        if (transactionPartners) {
            const transactionPartnersForSelection = transactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            const newTransactionPartnersForSelection = newItems.newTransactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            setTransactionPartnersForSelection([...transactionPartnersForSelection, ...newTransactionPartnersForSelection])
        }
    }, [transactionPartners, newItems.newTransactionPartners]);

    if (!currentAccount) {
        return <LoadingDialog />
    }

    return (
        <>
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
                    borderColor: inputError.nameError ? "var(--error-color)" : "null"
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
                    borderColor: inputError.transactionAmountError ? "var(--error-color)" : "null"
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
                                    currentAccount?.uid!,
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
                    borderColor: inputError.transactionPartnerError ? "var(--error-color)" : "null"
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