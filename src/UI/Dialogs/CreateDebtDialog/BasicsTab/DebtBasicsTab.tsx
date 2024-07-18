import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import CurrencyInputComponent from "../../../Components/Input/CurrencyInput/CurrencyInputComponent";
import AutoCompleteInputComponent from "../../../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {InputNameValueModel} from "../../../../Data/DataModels/Input/InputNameValueModel";
import {getInputValueUidByUid, getInputValueUidsByUids} from "../../../../Helper/HandyFunctionHelper";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../../Providers/DialogProvider";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/Database/useDatabaseRoute";
import {CreateDebtInputErrorModel} from "../../../../Data/ErrorModels/CreateDebtInputErrorModel";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {DBItem} from "../../../../Data/DatabaseModels/DBItem";
import {formatDateToStandardString} from "../../../../Helper/DateHelper";
import DateInputComponent from "../../../Components/Input/DateInputComponent/DateInputComponent";
import {getIcon, getIcons} from "../../../../Helper/IconMapper";
import {DebtType} from "../../../../Data/EnumTypes/DebtType";
import LoadingDialog from "../../LoadingDialog/LoadingDialog";

const DebtBasicsTab = ({
   inputError,
   isPreset,
   presetIcon,
   setPresetIcon,
   presetName,
   setPresetName,
   workDebt,
   updateDebt,
   transactionPartners,
   newItems,
   addNewItems,
   getDbItemContextMenuOptions
}: {
    inputError: CreateDebtInputErrorModel,
    isPreset: boolean,
    presetIcon: InputNameValueModel<string> | null,
    setPresetIcon: (value: InputNameValueModel<string> | null) => void,
    presetName: string,
    setPresetName: (value: string) => void,
    workDebt: DebtModel,
    updateDebt: (updater: (oldDebt: DebtModel) => DebtModel) => void,
    transactionPartners: TransactionPartnerModel[] | null,
    newItems: CreateDialogNewItems,
    addNewItems: (newItem: DBItem, newItemsKey: keyof CreateDialogNewItems) => DBItem
    getDbItemContextMenuOptions: (databaseRoute: DatabaseRoutes, newItemsKey: keyof CreateDialogNewItems, value: InputNameValueModel<DBItem>) => ContentAction[]
}) => {
    const dialog = useDialog()
    const translate = useTranslation()
    const getDatabaseRoute = useDatabaseRoute()
    const { currentAccount } = useCurrentAccount();

    const [transactionPartnersForSelection, setTransactionPartnersForSelection] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)
    const [userTransactionPartners, setUserTransactionPartners] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)
    const [nonUserTransactionPartners, setNonUserTransactionPartners] = React.useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)

    const debtTypeInputOptions = [
        new InputOptionModel(translate("default"), DebtType.DEFAULT),
        new InputOptionModel(translate("money-transfer"), DebtType.MONEY_TRANSFER)
    ];

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

    useEffect(() => {
        setUserTransactionPartners(transactionPartnersForSelection?.filter(transactionPartner => transactionPartner.value?.isUser) || [])
        setNonUserTransactionPartners(transactionPartnersForSelection?.filter(transactionPartner => !transactionPartner.value?.isUser) || [])
    }, [transactionPartnersForSelection]);

    if (!currentAccount) {
        return <LoadingDialog />
    }

    return (
        <>
            { isPreset && <>
                <AutoCompleteInputComponent<string>
                    title="Preset icon"
                    value={presetIcon}
                    onValueChange={(value) => {
                        setPresetIcon(value as InputNameValueModel<string> | null);
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
                <TextInputComponent
                    title={translate("preset-name")}
                    value={presetName}
                    onValueChange={(value) => {
                        setPresetName(value as string);
                    }}
                />
            </> }
            <RadioInputComponent
                title={translate("payment-type")}
                value={debtTypeInputOptions.find(option => option.value === workDebt.debtType)!}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.debtType = (value as InputOptionModel<DebtType>).value;
                        return oldDebt;
                    });
                }}
                options={debtTypeInputOptions}
            />
            { workDebt.debtType === DebtType.DEFAULT && <TextInputComponent
                title={translate("name-of-transaction")}
                value={workDebt.name}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.name = value as string;
                        return oldDebt;
                    });
                }}
                style={{
                    borderColor: inputError.nameError ? "var(--error-color)" : "null"
                }}
            /> }
            <CurrencyInputComponent
                title={translate("transaction-amount")}
                value={workDebt.transactionAmount}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.transactionAmount = value;
                        return oldDebt;
                    });
                }}
                currency={workDebt.currency}
                onCurrencyChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.currency = value;
                        return oldDebt;
                    });
                }}
                style={{
                    borderColor: inputError.transactionAmountError ? "var(--error-color)" : "null"
                }}
            />
            { workDebt.debtType === DebtType.DEFAULT && <AutoCompleteInputComponent
                title={translate("receiver-of-transaction")}
                value={getInputValueUidByUid(workDebt.transactionExecutorUid, nonUserTransactionPartners)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const newTransactionExecutor = value as InputNameValueModel<TransactionPartnerModel> | null;

                        if (newTransactionExecutor) {
                            if (newTransactionExecutor.value) {
                                oldDebt.transactionExecutorUid = newTransactionExecutor.value.uid
                            } else {
                                const newTransactionPartner = new TransactionPartnerModel(
                                    currentAccount!.uid,
                                    newTransactionExecutor.name,
                                    false
                                )

                                oldDebt.transactionExecutorUid = addNewItems(newTransactionPartner, "newTransactionPartners").uid
                            }
                        } else {
                            oldDebt.transactionExecutorUid = null;
                        }

                        return oldDebt;
                    });
                }}
                suggestions={nonUserTransactionPartners}
                style={{
                    borderColor: inputError.transactionExecutorError ? "var(--error-color)" : "null"
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "newTransactionPartners",
                    value
                )}
            /> }
            <AutoCompleteInputComponent
                title={translate("who-has-paid")}
                value={getInputValueUidByUid(workDebt.whoHasPaidUid, userTransactionPartners)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const newWhoHasPaid = value as InputNameValueModel<TransactionPartnerModel> | null;

                        if (newWhoHasPaid) {
                            if (newWhoHasPaid.value) {
                                oldDebt.whoHasPaidUid = newWhoHasPaid.value.uid
                            } else {
                                oldDebt.whoHasPaidUid = addNewItems(
                                    new TransactionPartnerModel(
                                        currentAccount!.uid,
                                        newWhoHasPaid.name,
                                        true
                                    ),
                                    "newTransactionPartners"
                                ).uid
                            }
                        } else {
                            oldDebt.whoHasPaidUid = null;
                        }

                        return oldDebt;
                    });
                }}
                suggestions={userTransactionPartners}
                style={{
                    borderColor: inputError.whoHasPaidError ? "var(--error-color)" : "null"
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "newTransactionPartners",
                    value
                )}
            />
            { workDebt.debtType === DebtType.DEFAULT ? <AutoCompleteInputComponent
                title={translate("who-was-paid-for")}
                value={getInputValueUidsByUids(workDebt.whoWasPaiFor, userTransactionPartners)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const newWhoWasPaidFor = value as InputNameValueModel<TransactionPartnerModel>[];

                        oldDebt.whoWasPaiFor = newWhoWasPaidFor?.map(whoWasPaidFor => {
                            return whoWasPaidFor.value?.uid || addNewItems(
                                new TransactionPartnerModel(
                                    currentAccount!.uid,
                                    whoWasPaidFor.name,
                                    true
                                ),
                                'newTransactionPartners'
                            ).uid
                        }) || [];

                        return oldDebt;
                    });
                }}
                suggestions={userTransactionPartners}
                placeholder={translate("add-person")}
                style={{
                    borderColor: inputError.whoWasPaidForError ? "var(--error-color)" : "null"
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "newTransactionPartners",
                    value
                )}
            /> : <AutoCompleteInputComponent
                title={translate("who-was-paid-for")}
                value={getInputValueUidByUid(workDebt.whoWasPaiFor[0], userTransactionPartners)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        const newWhoHasPaid = value as InputNameValueModel<TransactionPartnerModel> | null;

                        if (newWhoHasPaid) {
                            if (newWhoHasPaid.value) {
                                oldDebt.whoWasPaiFor = [newWhoHasPaid.value.uid]
                            } else {
                                oldDebt.whoWasPaiFor = [addNewItems(
                                    new TransactionPartnerModel(
                                        currentAccount!.uid,
                                        newWhoHasPaid.name,
                                        false
                                    ),
                                    "newTransactionPartners"
                                ).uid]
                            }
                        } else {
                            oldDebt.whoWasPaiFor = [];
                        }

                        return oldDebt;
                    });
                }}
                suggestions={userTransactionPartners}
                style={{
                    borderColor: inputError.whoHasPaidError ? "var(--error-color)" : "null"
                }}
                allowCreatingNew={true}
                contextMenuOptions={(value) => getDbItemContextMenuOptions(
                    DatabaseRoutes.TRANSACTION_PARTNERS,
                    "newTransactionPartners",
                    value
                )}
            /> }
            <DateInputComponent
                title={translate("when-was-paid")}
                value={new Date(workDebt.date)}
                onValueChange={(value) => {
                    updateDebt((oldDebt) => {
                        oldDebt.date = formatDateToStandardString(value);
                        return oldDebt;
                    })
                }}
                maxDate={new Date()}
            />
        </>
    );
};

export default DebtBasicsTab;