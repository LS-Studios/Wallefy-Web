import React, {useEffect, useState} from 'react';
import DialogOverlay from "./DialogOverlay/DialogOverlay";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {TransactionPresetModel} from "../../Data/DatabaseModels/TransactionPresetModel";
import {PresetQuestionType} from "../../Data/EnumTypes/PresetQuestionType";
import TextInputComponent from "../Components/Input/TextInput/TextInputComponent";
import {RepetitionModel} from "../../Data/DataModels/Reptition/RepetitionModel";
import RepetitionRateInput from "./CreateTransactionDialog/RepetitionTab/RepetitionRateInput";
import {formatDateToStandardString} from "../../Helper/DateHelper";
import {RepetitionRateType} from "../../Data/EnumTypes/RepetitionRateType";
import DateInputComponent from "../Components/Input/DateInputComponent/DateInputComponent";
import {getDisabledWeekDays} from "../../Helper/RepetitionHelper";
import {getInputValueUidByUid, getInputValueUidsByUids} from "../../Helper/HandyFunctionHelper";
import {InputNameValueModel} from "../../Data/DataModels/Input/InputNameValueModel";
import {TransactionPartnerModel} from "../../Data/DatabaseModels/TransactionPartnerModel";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import AutoCompleteInputComponent from "../Components/Input/AutoCompleteInput/AutoCompleteInputComponent";
import {useTransactionPartners} from "../../CustomHooks/Database/useTransactionPartners";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import LoadingDialog from "./LoadingDialog/LoadingDialog";
import {useNewItems} from "../../CustomHooks/useNewItems";
import CurrencyInputComponent from "../Components/Input/CurrencyInput/CurrencyInputComponent";
import {CurrencyValueModel} from "../../Data/DataModels/CurrencyValueModel";
import {CurrencyModel} from "../../Data/DataModels/CurrencyModel";
import {useDatabaseRoute} from "../../CustomHooks/Database/useDatabaseRoute";
import {useDialog} from "../../Providers/DialogProvider";
import {useToast} from "../../Providers/Toast/ToastProvider";
import {DebtPresetModel} from "../../Data/DatabaseModels/DebtPresetModel";
import {MdTune} from "react-icons/md";
import {DialogModel} from "../../Data/DataModels/DialogModel";
import {DistributionModel} from "../../Data/DataModels/DistributionModel";
import DistributionDialog from "./DistributionDialog/DistributionDialog";
import {DebtModel} from "../../Data/DatabaseModels/DebtModel";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

interface AnswersType {
    [key: string]: string | string[] | CurrencyModel | boolean | number | RepetitionModel | CurrencyValueModel | null;
}

function PresetDialog<T extends TransactionPresetModel | DebtPresetModel>({
    preset,
    isDebt
}: {
    preset: T,
    isDebt: boolean
}) {
    const toast = useToast()
    const dialog = useDialog()
    const translate = useTranslation()
    const getDatabaseRoute = useDatabaseRoute()
    const { currentAccount } = useCurrentAccount();

    const [answers, setAnswers] = useState<AnswersType | null>(null)
    const [repetitionKey, setRepetitionKey] = useState<keyof T | undefined>(undefined)
    const [currencyValueKey, setCurrencyValueKey] = useState<keyof T | undefined>(undefined)
    const [transactionPartnersValueKey, setTransactionPartnersValueKey] = useState<keyof T | undefined>(undefined)
    const [error, setError] = useState<string | null>(null)

    const transactionPartners = useTransactionPartners()

    const [userTransactionPartnersForSelection, setUserTransactionPartnersForSelection] = useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)
    const [nonUserTransactionPartnersForSelection, setNonUserTransactionPartnersForSelection] = useState<InputNameValueModel<TransactionPartnerModel>[] | null>(null)

    const [distributions, setDistributions] = useState<DistributionModel[]>([])

    const {
        newItems,
        addNewItems,
        getDbItemContextMenuOptions,
    } = useNewItems()

    const updateAnswers = (updater: (oldAnswers: AnswersType | null) => AnswersType | null) => {
        setAnswers((oldAnswers) => {
            const newAnswers = {...oldAnswers}
            Object.assign(newAnswers, updater(oldAnswers))
            return newAnswers
        })
    }

    useEffect(() => {
        // @ts-ignore
        setAnswers(preset.presetQuestions.reduce((acc: AnswersType, question) => {
            switch (question.questionType) {
                case PresetQuestionType.CURRENCY:
                    acc[question.answerKey] = new CurrencyValueModel(
                        preset.presetItem.transactionAmount,
                        preset.presetItem.currency
                    )
                    break
                case PresetQuestionType.PAST_DATE:
                    // @ts-ignore
                    acc[question.answerKey] = preset.presetItem[question.answerKey] || formatDateToStandardString(new Date())
                    break
                case PresetQuestionType.FUTURE_DATE:
                    // @ts-ignore
                    acc[question.answerKey] = preset.presetItem[question.answerKey] || formatDateToStandardString(new Date())
                    break
                default:
                    // @ts-ignore
                    acc[question.answerKey] = preset.presetItem[question.answerKey]
                    break
            }
            return acc
        }, {}))

        // @ts-ignore
        setRepetitionKey(preset.presetQuestions.find((_question) => _question.questionType === PresetQuestionType.REPETITION)?.answerKey)

        // @ts-ignore
        setCurrencyValueKey(preset.presetQuestions.find((_question) => _question.questionType === PresetQuestionType.CURRENCY)?.answerKey)

        // @ts-ignore
        setTransactionPartnersValueKey(preset.presetQuestions.find((_question) => _question.questionType === PresetQuestionType.TRANSACTION_PARTNER_USERS)?.answerKey)
    }, []);

    useEffect(() => {
        if (transactionPartners) {
            const transactionPartnersForSelection = transactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            const newTransactionPartnersForSelection = newItems.newTransactionPartners.map(transactionPartner => new InputNameValueModel(transactionPartner.name, transactionPartner))
            setUserTransactionPartnersForSelection([...transactionPartnersForSelection, ...newTransactionPartnersForSelection].filter(transactionPartner => transactionPartner.value?.isUser))
            setNonUserTransactionPartnersForSelection([...transactionPartnersForSelection, ...newTransactionPartnersForSelection].filter(transactionPartner => !transactionPartner.value?.isUser))
        }
    }, [transactionPartners, newItems.newTransactionPartners]);

    useEffect(() => {
        if (!answers || !currencyValueKey || !transactionPartnersValueKey) return

        const newDistributions: DistributionModel[] = [];

        const selectedTransactionPartners = answers[transactionPartnersValueKey] as string[]

        selectedTransactionPartners.forEach((whoWasPaidFor) => {
            newDistributions.push(new DistributionModel(whoWasPaidFor, 100 / selectedTransactionPartners.length));
        })

        setDistributions(newDistributions)
    }, [
        currencyValueKey,
        transactionPartnersValueKey,
        answers,
        answers && currencyValueKey ? answers[currencyValueKey] : null,
        answers && transactionPartnersValueKey ? answers[transactionPartnersValueKey] : null
    ]);

    if (!currentAccount || !answers) {
        return <LoadingDialog />
    }

    return (
        <DialogOverlay
            actions={[
                new ContentAction(
                    translate("create"),
                    () => {
                        const newPresetItem = { ...preset.presetItem }

                        let doHaveErrors = false

                        preset.presetQuestions.forEach((question) => {
                            if (doHaveErrors) return;

                            if (question.questionType === PresetQuestionType.CURRENCY) {
                                const currencyValue = answers[question.answerKey] as CurrencyValueModel

                                if (currencyValue.transactionAmount === null || currencyValue.transactionAmount === undefined) {
                                    toast.open(translate("please-fill-all-fields"))
                                    setError(question.uid)
                                    doHaveErrors = true
                                    return
                                }

                                newPresetItem.transactionAmount = currencyValue.transactionAmount
                                newPresetItem.currency = currencyValue.currency
                            } else {
                                if (answers[question.answerKey] === null || answers[question.answerKey] === undefined) {
                                    setError(question.uid)
                                    doHaveErrors = true
                                    return
                                }
                                // @ts-ignore
                                newPresetItem[question.answerKey] = answers[question.answerKey]
                            }
                        })

                        if (doHaveErrors) {
                            return
                        }

                        if (isDebt) {
                            (newPresetItem as DebtModel).distributions = distributions
                        }

                        const promises: Promise<any>[] = []

                        if (transactionPartners) {
                            newPresetItem.transactionExecutorFallback = [...transactionPartners, ...newItems.newTransactionPartners].find(partner => partner.uid === newPresetItem.transactionExecutorUid)?.name || newPresetItem.transactionExecutorFallback
                            const allTransactionPartners = [...transactionPartners, ...newItems.newTransactionPartners]

                            if (isDebt) {
                                const castedDebt = newPresetItem as DebtModel
                                castedDebt.whoHasPaidFallback = allTransactionPartners.find(partner => partner.uid === castedDebt.whoHasPaidUid)?.name || castedDebt.whoHasPaidFallback
                                castedDebt.whoWasPaiForFallback = Object.fromEntries(castedDebt.whoWasPaiFor.map(whoWasPaidForUid => [whoWasPaidForUid, allTransactionPartners.find(tp => tp.uid === whoWasPaidForUid)?.name || ""]))
                            }

                            newItems.newTransactionPartners.forEach((newTransactionPartner) => {
                                promises.push(
                                    getActiveDatabaseHelper().addDBItem(
                                        getDatabaseRoute!(DatabaseRoutes.TRANSACTION_PARTNERS),
                                        newTransactionPartner
                                    )
                                )
                            })
                        }

                        Promise.all(promises).then(() => {
                            if (isDebt) {
                                getActiveDatabaseHelper().addDBItem(
                                    getDatabaseRoute!(DatabaseRoutes.DEBTS),
                                    newPresetItem
                                ).then(() => {
                                    dialog.closeCurrent()
                                })
                            } else {
                                getActiveDatabaseHelper().addDBItem(
                                    getDatabaseRoute!(DatabaseRoutes.TRANSACTIONS),
                                    newPresetItem
                                ).then(() => {
                                    dialog.closeCurrent()
                                })
                            }
                        })
                    },
                    false,
                    !getDatabaseRoute
                )
            ]}
        >
            {
                preset.presetQuestions.map((question) => {
                    switch (question.questionType) {
                        case PresetQuestionType.TEXT:
                            return (
                                <TextInputComponent
                                    title={question.question}
                                    value={answers[question.answerKey] as string}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = value as string
                                            return oldAnswers
                                        })
                                    }}
                                    style={{
                                        borderColor: error === question.uid ? "var(--error-color)" : undefined
                                    }}
                                />
                            )
                        case PresetQuestionType.CURRENCY:
                            return (
                                <CurrencyInputComponent
                                    title={question.question}
                                    value={(answers[question.answerKey] as CurrencyValueModel).transactionAmount}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = {
                                                ...oldAnswers![question.answerKey] as CurrencyValueModel,
                                                transactionAmount: value as number
                                            };
                                            return oldAnswers;
                                        });
                                    }}
                                    currency={(answers[question.answerKey] as CurrencyValueModel).currency}
                                    onCurrencyChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = {
                                                ...oldAnswers![question.answerKey] as CurrencyValueModel,
                                                currency: value as CurrencyModel
                                            };
                                            return oldAnswers;
                                        })
                                    }}
                                    style={{
                                        borderColor: error === question.uid ? "var(--error-color)" : undefined
                                    }}
                                />
                            )
                        case PresetQuestionType.TRANSACTION_PARTNER_NO_USER:
                            return (
                                <AutoCompleteInputComponent
                                    title={question.question}
                                    value={getInputValueUidByUid(answers[question.answerKey] as string, nonUserTransactionPartnersForSelection)}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            const newTransactionExecutor = value as InputNameValueModel<TransactionPartnerModel> | null;

                                            if (newTransactionExecutor) {
                                                if (newTransactionExecutor.value) {
                                                    oldAnswers![question.answerKey] = newTransactionExecutor.value.uid
                                                } else {
                                                    const newTransactionPartner = new TransactionPartnerModel(
                                                        currentAccount?.uid,
                                                        newTransactionExecutor.name,
                                                        false
                                                    )

                                                    oldAnswers![question.answerKey] = addNewItems(newTransactionPartner, "newTransactionPartners").uid
                                                }
                                            } else {
                                                oldAnswers![question.answerKey] = null;
                                            }

                                            return oldAnswers;
                                        });
                                    }}
                                    suggestions={nonUserTransactionPartnersForSelection}
                                    allowCreatingNew={true}
                                    contextMenuOptions={(value) => getDbItemContextMenuOptions(
                                        DatabaseRoutes.TRANSACTION_PARTNERS,
                                        "newTransactionPartners",
                                        value
                                    )}
                                    style={{
                                        borderColor: error === question.uid ? "var(--error-color)" : undefined
                                    }}
                                />
                            )
                        case PresetQuestionType.TRANSACTION_PARTNER_USER:
                            return (
                                <AutoCompleteInputComponent
                                    title={question.question}
                                    value={getInputValueUidByUid(answers[question.answerKey] as string, userTransactionPartnersForSelection)}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            const newTransactionExecutor = value as InputNameValueModel<TransactionPartnerModel> | null;

                                            if (newTransactionExecutor) {
                                                if (newTransactionExecutor.value) {
                                                    oldAnswers![question.answerKey] = newTransactionExecutor.value.uid
                                                } else {
                                                    const newTransactionPartner = new TransactionPartnerModel(
                                                        currentAccount?.uid,
                                                        newTransactionExecutor.name,
                                                        true
                                                    )

                                                    oldAnswers![question.answerKey] = addNewItems(newTransactionPartner, "newTransactionPartners").uid
                                                }
                                            } else {
                                                oldAnswers![question.answerKey] = null;
                                            }

                                            return oldAnswers;
                                        });
                                    }}
                                    suggestions={userTransactionPartnersForSelection}
                                    allowCreatingNew={true}
                                    contextMenuOptions={(value) => getDbItemContextMenuOptions(
                                        DatabaseRoutes.TRANSACTION_PARTNERS,
                                        "newTransactionPartners",
                                        value
                                    )}
                                    style={{
                                        borderColor: error === question.uid ? "var(--error-color)" : undefined
                                    }}
                                />
                            )
                        case PresetQuestionType.TRANSACTION_PARTNER_USERS:
                            return (
                                <AutoCompleteInputComponent
                                    title={question.question}
                                    Icon={MdTune}
                                    onIconClick={(e) => {
                                        e.stopPropagation()
                                        dialog.open(
                                            new DialogModel(
                                                translate("distribution"),
                                                <DistributionDialog
                                                    distributions={distributions}
                                                    onDistributionChange={(newDistributions) => {
                                                        setDistributions(newDistributions)
                                                    }}
                                                    currencyValue={answers[currencyValueKey!] as CurrencyValueModel || new CurrencyValueModel(
                                                        preset.presetItem.transactionAmount,
                                                        preset.presetItem.currency
                                                    )}
                                                    transactionPartners={transactionPartners}
                                                    newItems={newItems}
                                                />
                                            )
                                        )
                                    }}
                                    value={getInputValueUidsByUids(answers[question.answerKey] as string[], userTransactionPartnersForSelection)}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            const newWhoWasPaidFor = value as InputNameValueModel<TransactionPartnerModel>[];

                                            oldAnswers![question.answerKey] = newWhoWasPaidFor?.map(whoWasPaidFor => {
                                                return whoWasPaidFor.value?.uid || addNewItems(
                                                    new TransactionPartnerModel(
                                                        currentAccount!.uid,
                                                        whoWasPaidFor.name,
                                                        true
                                                    ),
                                                    'newTransactionPartners'
                                                ).uid
                                            }) || [];

                                            return oldAnswers;
                                        });
                                    }}
                                    suggestions={userTransactionPartnersForSelection}
                                    placeholder={translate("add-person")}
                                    allowCreatingNew={true}
                                    contextMenuOptions={(value) => getDbItemContextMenuOptions(
                                        DatabaseRoutes.TRANSACTION_PARTNERS,
                                        "newTransactionPartners",
                                        value
                                    )}
                                    style={{
                                        borderColor: error === question.uid ? "var(--error-color)" : undefined
                                    }}
                                />
                            )
                        case PresetQuestionType.REPETITION:
                            return (
                                <RepetitionRateInput
                                    title={question.question}
                                    repetition={answers[question.answerKey] as RepetitionModel}
                                    updateRepetition={(updater) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = updater(oldAnswers![question.answerKey] as RepetitionModel)
                                            return oldAnswers
                                        })
                                    }}
                                />
                            )
                        case PresetQuestionType.PAST_DATE:
                            return (
                                <DateInputComponent
                                    title={question.question}
                                    value={new Date(answers[question.answerKey] as string)}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = formatDateToStandardString(value as Date)
                                            return oldAnswers
                                        })
                                    }}
                                    maxDate={new Date()}
                                    disabledWeekDays={repetitionKey ? (answers[repetitionKey] as RepetitionModel).repetitionRateType === RepetitionRateType.WEEK ? getDisabledWeekDays(answers[repetitionKey] as RepetitionModel) : [] : []}
                                />
                            )
                        case PresetQuestionType.FUTURE_DATE:
                            return (
                                <DateInputComponent
                                    title={question.question}
                                    value={new Date(answers[question.answerKey] as string)}
                                    onValueChange={(value) => {
                                        updateAnswers((oldAnswers) => {
                                            oldAnswers![question.answerKey] = formatDateToStandardString(value as Date)
                                            return oldAnswers
                                        })
                                    }}
                                    minDate={new Date()}
                                    disabledWeekDays={repetitionKey ? (answers[repetitionKey] as RepetitionModel).repetitionRateType === RepetitionRateType.WEEK ? getDisabledWeekDays(answers[repetitionKey] as RepetitionModel) : [] : []}
                                />
                            )
                        default:
                            return null
                    }
                })
            }
        </DialogOverlay>
    );
};

export default PresetDialog;