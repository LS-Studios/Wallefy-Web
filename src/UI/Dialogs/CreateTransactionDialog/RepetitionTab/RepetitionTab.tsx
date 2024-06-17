import React from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../../Data/Input/InputOptionModel";
import {ExecutionType} from "../../../../Data/Transactions/ExecutionType";
import {RepetitionType} from "../../../../Data/Transactions/RepetitionType";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";

import './RepetitionTab.scss';
import {RepetitionRateType} from "../../../../Data/Transactions/RepetitionRateType";
import {DayOfWeekModel} from "../../../../Data/Transactions/DayOfWeekModel";
import DateInputComponent from "../../../Components/Input/DateInputComponent/DateInputComponent";
import CheckboxInputComponent from "../../../Components/Input/CheckboxInput/CheckboxInputComponent";
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import {RepetitionModel} from "../../../../Data/Transactions/RepetitionModel";
import {
    formatDateToStandardString,
    getWeekDayNameShort
} from "../../../../Helper/DateHelper";
import {useToast} from "../../../../Providers/Toast/ToastProvider";
import useEffectNotInitial from "../../../../CustomHooks/useEffectNotInitial";

const RepetitionTab = ({
   workTransaction,
   updateTransaction
}: {
    workTransaction: TransactionModel,
    updateTransaction: (updater: (oldTransaction: TransactionModel) => TransactionModel) => void
}) => {
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
        new InputOptionModel("Past", ExecutionType.PAST),
        new InputOptionModel("Now", ExecutionType.NOW),
        new InputOptionModel("Later", ExecutionType.LATER)
    ];

    const repetitionTypeOptions = [
        new InputOptionModel("Onetime", RepetitionType.ONETIME),
        new InputOptionModel("+1 times", RepetitionType.MULTIPLE),
        new InputOptionModel("Undefined", RepetitionType.UNDEFINED)
    ];

    const repetitionRateTypeOptions = [
        new InputOptionModel("Day", RepetitionRateType.DAY),
        new InputOptionModel("Week", RepetitionRateType.WEEK),
        new InputOptionModel("Month", RepetitionRateType.MONTH),
        new InputOptionModel("Year", RepetitionRateType.YEAR)
    ];

    const dayOfWeekOptions = [
        new InputOptionModel(getWeekDayNameShort(1, 'de-DE'), DayOfWeekModel.MONDAY),
        new InputOptionModel(getWeekDayNameShort(2, 'de-DE'), DayOfWeekModel.TUESDAY),
        new InputOptionModel(getWeekDayNameShort(3, 'de-DE'), DayOfWeekModel.WEDNESDAY),
        new InputOptionModel(getWeekDayNameShort(4, 'de-DE'), DayOfWeekModel.THURSDAY),
        new InputOptionModel(getWeekDayNameShort(5, 'de-DE'), DayOfWeekModel.FRIDAY),
        new InputOptionModel(getWeekDayNameShort(6, 'de-DE'), DayOfWeekModel.SATURDAY),
        new InputOptionModel(getWeekDayNameShort(0, 'de-DE'), DayOfWeekModel.SUNDAY)
    ];

    const [repetitionType, setRepetitionType] = React.useState<InputOptionModel<RepetitionType>>(getRepetitionTypeByAmount(workTransaction.repetition.repetitionAmount || null));

    const getRepetitionRateName = (repetitionRateType: RepetitionRateType) => {
        switch (repetitionRateType) {
            case RepetitionRateType.DAY:
                return "Day";
            case RepetitionRateType.WEEK:
                return "Week";
            case RepetitionRateType.MONTH:
                return "Month";
            case RepetitionRateType.YEAR:
                return "Year";
            default:
                return "Undefined";
        }
    }

    const adjustDateBasedOnWeekDay = (date: Date, dayOfWeek: DayOfWeekModel) => {
        let day = date.getDay();
        let diff = dayOfWeek - day;
        if (diff < 0) {
            diff += 7;
        }
        date.setDate(date.getDate() + diff);
        return date;
    }

    const getDisabledWeekDays = () => {
        return [
            DayOfWeekModel.MONDAY,
            DayOfWeekModel.TUESDAY,
            DayOfWeekModel.WEDNESDAY,
            DayOfWeekModel.THURSDAY,
            DayOfWeekModel.FRIDAY,
            DayOfWeekModel.SATURDAY,
            DayOfWeekModel.SUNDAY
        ].filter((day) => !workTransaction.repetition.repetitionDaysInWeek.includes(day));
    }

    const updateRepetition = (updater: ((oldRepetition: RepetitionModel) => RepetitionModel)) => {
        updateTransaction((oldTransaction) => {
            oldTransaction.repetition = updater(oldTransaction.repetition);
            return oldTransaction;
        });
    }

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
                toast.open("Es muss mindestens ein Tag ausgewählt sein!")
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
                title="Execution type"
                value={executionTypeOptions.find(option => option.value === workTransaction.repetition.executionType)!}
                onValueChange={(value) => updateRepetition((oldRepetition) => {
                    oldRepetition.executionType = (value as InputOptionModel<ExecutionType>).value;
                    return oldRepetition;
                })}
                options={executionTypeOptions}
            />
            { workTransaction.repetition.executionType === ExecutionType.LATER && <>
                <InputBaseComponent
                    title="Number of repetitions"
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
                { repetitionType.value !== RepetitionType.ONETIME && <>
                    <InputBaseComponent
                        title="Repetition rate"
                        style={{
                            border: "2px solid " + variables.stroke_color
                        }}
                    >
                        <div className="create-transaction-dialog-repetition-amount">
                            <RadioInputComponent
                                value={repetitionRateTypeOptions.find(option => option.value === workTransaction.repetition.repetitionRateType)!}
                                onValueChange={(value) => {
                                    updateRepetition((oldRepetition) => {
                                        oldRepetition.repetitionRateType = (value as InputOptionModel<RepetitionRateType>).value;
                                        return oldRepetition;
                                    })
                                }}
                                options={repetitionRateTypeOptions}
                            />
                            <div className="create-transaction-dialog-repetition-rate-times-row">
                                <span>Every</span>
                                <TextInputComponent
                                    value={workTransaction.repetition.repetitionRate}
                                    onValueChange={(value) => {
                                        updateRepetition((oldRepetition) => {
                                            oldRepetition.repetitionRate = value as number | null;
                                            return oldRepetition;
                                        })
                                    }}
                                    type="number"
                                    placeholder="1"
                                />
                                <span>{getRepetitionRateName(workTransaction.repetition.repetitionRateType)}</span>
                            </div>
                            { workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK &&
                                <RadioInputComponent
                                    value={workTransaction.repetition.repetitionDaysInWeek.map((dayOfWeek) => dayOfWeekOptions.find(option => option.value === dayOfWeek)!)}
                                    onValueChange={(value) => {
                                        updateRepetition((oldRepetition) => {
                                            oldRepetition.repetitionDaysInWeek = (value as InputOptionModel<DayOfWeekModel>[]).map((option) => option.value);
                                            return oldRepetition;
                                        })
                                    }}
                                    options={dayOfWeekOptions}
                                />
                            }
                        </div>
                    </InputBaseComponent>
                </>}
                <CheckboxInputComponent
                    text="Pending"
                    value={workTransaction.repetition.isPending}
                    onValueChange={(value) => {
                        updateRepetition((oldRepetition) => {
                            oldRepetition.isPending = value;
                            return oldRepetition;
                        })
                    }}
                    style={{
                        border: "2px solid " + variables.stroke_color
                    }}
                />
            </>}
            { workTransaction.repetition.executionType !== ExecutionType.NOW && !workTransaction.repetition.isPending && <>
                <DateInputComponent
                    title={workTransaction.repetition.executionType === ExecutionType.LATER ? "Start date" : "Execution date"}
                    value={new Date(workTransaction.date)}
                    onValueChange={(value) => {
                        updateTransaction((oldTransaction) => {
                            oldTransaction.date = formatDateToStandardString(value);
                            return oldTransaction;
                        })
                    }}
                    maxDate={workTransaction.repetition.executionType === ExecutionType.PAST ? new Date(): undefined}
                    minDate={workTransaction.repetition.executionType === ExecutionType.LATER ? new Date() : undefined}
                    disabledWeekDays={workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK ? getDisabledWeekDays() : []}
                />
            </> }
        </>
    );
};

export default RepetitionTab;