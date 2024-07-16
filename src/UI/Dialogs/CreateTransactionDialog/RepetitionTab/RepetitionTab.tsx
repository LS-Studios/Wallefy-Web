import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {ExecutionType} from "../../../../Data/EnumTypes/ExecutionType";
import {RepetitionType} from "../../../../Data/EnumTypes/RepetitionType";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";

import './RepetitionTab.scss';
import {RepetitionRateType} from "../../../../Data/EnumTypes/RepetitionRateType";
import {DayOfWeekModel} from "../../../../Data/DataModels/Reptition/DayOfWeekModel";
import DateInputComponent from "../../../Components/Input/DateInputComponent/DateInputComponent";
import CheckboxInputComponent from "../../../Components/Input/CheckboxInput/CheckboxInputComponent";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {RepetitionModel} from "../../../../Data/DataModels/Reptition/RepetitionModel";
import {
    formatDateToStandardString, getCurrentDate,
    getWeekDayNameShort
} from "../../../../Helper/DateHelper";
import {useToast} from "../../../../Providers/Toast/ToastProvider";
import useEffectNotInitial from "../../../../CustomHooks/useEffectNotInitial";
import {getDisabledWeekDays, RepetitionHelper} from "../../../../Helper/RepetitionHelper";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
import RepetitionRateInput from "./RepetitionRateInput";
;

const RepetitionTab = ({
   workTransaction,
   updateTransaction
}: {
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {
    const getDatabaseRoute = useDatabaseRoute()
    const settings = useSettings()
    const translate = useTranslation()
    const toast = useToast()

    const getRepetitionTypeByAmount = (amount: number | null) => {
        if (amount === null) {
            return repetitionTypeOptions[2]
        } else if (amount === 1) {
            return repetitionTypeOptions[0]
        } else {
            return repetitionTypeOptions[1]
        }
    }

    const executionTypeOptions = [
        new InputOptionModel(translate("past"), ExecutionType.PAST),
        new InputOptionModel(translate("now"), ExecutionType.NOW),
        new InputOptionModel(translate("later"), ExecutionType.LATER)
    ];

    const repetitionTypeOptions = [
        new InputOptionModel(translate("onetime"), RepetitionType.ONETIME),
        new InputOptionModel(translate("+1-times"), RepetitionType.MULTIPLE),
        new InputOptionModel(translate("undefined"), RepetitionType.UNDEFINED)
    ];

    const [repetitionType, setRepetitionType] = React.useState<InputOptionModel<RepetitionType>>(getRepetitionTypeByAmount(workTransaction.repetition.repetitionAmount || null));

    const adjustDateBasedOnWeekDay = (date: Date, dayOfWeek: DayOfWeekModel) => {
        let day = date.getDay();
        let diff = dayOfWeek - day;
        if (diff < 0) {
            diff += 7;
        }
        date.setDate(date.getDate() + diff);
        return date;
    }

    const updateRepetition = (updater: ((oldRepetition: RepetitionModel) => RepetitionModel)) => {
        updateTransaction((oldTransaction) => {
            oldTransaction.repetition = updater(oldTransaction.repetition);
            return oldTransaction;
        });
    }



    useEffectNotInitial(() => {
        if (workTransaction.history) {
            updateRepetition((oldRepetition) => {
                oldRepetition.executionType = ExecutionType.PAST;
                return oldRepetition;
            })
        } else if (getDatabaseRoute) {
            updateTransaction((oldTransaction) => {
                while (new Date(oldTransaction.date) < getCurrentDate()) {
                    oldTransaction.date = new RepetitionHelper(oldTransaction).calculateNextRepetitionDate(getDatabaseRoute, true)!
                }
                return oldTransaction;
            })
        }
    }, [getDatabaseRoute, workTransaction.repetition.isPending, workTransaction.repetition.isPaused])

    useEffectNotInitial(() => {
        updateTransaction((oldTransaction) => {
            oldTransaction.date = formatDateToStandardString(new Date())
            return oldTransaction;
        });

        switch (workTransaction.repetition.executionType) {
            case ExecutionType.LATER:
                updateRepetition((oldRepetition) => {
                    return oldRepetition;
                })
                break;
            default:
                updateRepetition((oldRepetition) => {
                    oldRepetition.repetitionAmount = null;
                    oldRepetition.repetitionRateType = RepetitionRateType.DAY;
                    oldRepetition.repetitionRate = null;
                    oldRepetition.repetitionDaysInWeek = [DayOfWeekModel.MONDAY];
                    setRepetitionType(repetitionTypeOptions[0])
                    return oldRepetition;
                })
                break;
        }
    }, [workTransaction.repetition.executionType]);

    useEffectNotInitial(() => {
        if (workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK) {
            updateTransaction((oldTransaction) => {
                let date = new Date(oldTransaction.date);
                oldTransaction.date = formatDateToStandardString(adjustDateBasedOnWeekDay(date, workTransaction.repetition.repetitionDaysInWeek[0]));
                return oldTransaction;
            });
        }
    }, [workTransaction.repetition.repetitionRateType]);

    useEffectNotInitial(() => {
        if (workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK) {
            if (workTransaction.repetition.repetitionDaysInWeek.length === 0) {
                toast.open(translate("select-at-least-on-day"))
                updateRepetition((oldRepetition) => {
                    oldRepetition.repetitionDaysInWeek = [DayOfWeekModel.MONDAY];
                    return oldRepetition;
                })
            }

            updateTransaction((oldTransaction) => {
                let date = new Date(oldTransaction.date);
                oldTransaction.date = formatDateToStandardString(adjustDateBasedOnWeekDay(date, workTransaction.repetition.repetitionDaysInWeek[0]));
                return oldTransaction;
            });
        }
    }, [workTransaction.repetition.repetitionDaysInWeek]);

    useEffectNotInitial(() => {
        switch (repetitionType.value) {
            case RepetitionType.ONETIME:
                updateRepetition((oldRepetition) => {
                    oldRepetition.repetitionAmount = 1;
                    return oldRepetition;
                })
                break;
            case RepetitionType.MULTIPLE:
                updateRepetition((oldRepetition) => {
                    oldRepetition.repetitionAmount = 2;
                    return oldRepetition;
                })
                break;
            default:
                updateRepetition((oldRepetition) => {
                    oldRepetition.repetitionAmount = null;
                    return oldRepetition;
                })
                break;
        }
    }, [repetitionType.value]);

    return (
        <>
            <RadioInputComponent
                title={translate("execution-type")}
                value={executionTypeOptions.find(option => option.value === workTransaction.repetition.executionType)!}
                onValueChange={(value) => updateRepetition((oldRepetition) => {
                    oldRepetition.executionType = (value as InputOptionModel<ExecutionType>).value;
                    return oldRepetition;
                })}
                options={executionTypeOptions}
            />
            { workTransaction.repetition.executionType === ExecutionType.LATER && <>
                <InputBaseComponent
                    title={translate("number-of-repetitions")}
                    style={{
                        border: "2px solid " + variables.stroke_color
                    }}
                >
                    <div className="create-transaction-dialog-repetition-amount">
                        <RadioInputComponent
                            value={repetitionType}
                            onValueChange={(value) => setRepetitionType(value as InputOptionModel<any>) }
                            options={repetitionTypeOptions}
                        />
                        { repetitionType.value === RepetitionType.MULTIPLE &&
                            <div className="create-transaction-dialog-repetition-amount-times-row">
                                <TextInputComponent
                                    value={workTransaction.repetition.repetitionAmount}
                                    onValueChange={(value) => {
                                        updateRepetition((oldRepetition) => {
                                            oldRepetition.repetitionAmount = value as number | null;
                                            return oldRepetition;
                                        })
                                    }}
                                    type="number"
                                    placeholder="1"
                                    onBlur={() => {
                                        setRepetitionType(getRepetitionTypeByAmount(workTransaction.repetition.repetitionAmount || 0));
                                    }}
                                />
                                <span>times</span>
                            </div>
                        }
                    </div>
                </InputBaseComponent>
                { repetitionType.value !== RepetitionType.ONETIME && <RepetitionRateInput
                    title={translate("repetition-rate")}
                    repetition={workTransaction.repetition}
                    updateRepetition={updateRepetition}
                /> }
                { repetitionType.value === RepetitionType.ONETIME ? <CheckboxInputComponent
                    text={translate("pending")}
                    value={workTransaction.repetition.isPending}
                    onValueChange={(value) => {
                        updateRepetition((oldRepetition) => {
                            oldRepetition.isPending = value;
                            return oldRepetition;
                        })
                    }}
                /> : <CheckboxInputComponent
                    text={translate("paused")}
                    value={workTransaction.repetition.isPaused}
                    onValueChange={(value) => {
                        updateRepetition((oldRepetition) => {
                            oldRepetition.isPaused = value;
                            return oldRepetition;
                        })
                    }}
                    style={{
                        border: "2px solid " + variables.stroke_color
                    }}
                /> }
            </>}
            { workTransaction.repetition.executionType !== ExecutionType.NOW && !workTransaction.repetition.isPending && !workTransaction.repetition.isPaused && <>
                <DateInputComponent
                    title={workTransaction.repetition.executionType === ExecutionType.LATER ? translate("start-date") : translate("execution-date")}
                    value={new Date(workTransaction.date)}
                    onValueChange={(value) => {
                        updateTransaction((oldTransaction) => {
                            oldTransaction.date = formatDateToStandardString(value);
                            return oldTransaction;
                        })
                    }}
                    maxDate={workTransaction.repetition.executionType === ExecutionType.PAST ? new Date(): undefined}
                    minDate={workTransaction.repetition.executionType === ExecutionType.LATER ? new Date() : undefined}
                    disabledWeekDays={workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK ? getDisabledWeekDays(workTransaction.repetition) : []}
                />
            </> }
        </>
    );
};

export default RepetitionTab;