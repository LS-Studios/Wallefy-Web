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
import {RepetitionHelper} from "../../../../Helper/RepetitionHelper";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
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

    const repetitionRateTypeOptions = [
        new InputOptionModel(translate("day"), RepetitionRateType.DAY),
        new InputOptionModel(translate("week"), RepetitionRateType.WEEK),
        new InputOptionModel(translate("month"), RepetitionRateType.MONTH),
        new InputOptionModel(translate("year"), RepetitionRateType.YEAR)
    ];

    const dayOfWeekOptions = [
        new InputOptionModel(getWeekDayNameShort(1, settings?.language || 'de-DE'), DayOfWeekModel.MONDAY),
        new InputOptionModel(getWeekDayNameShort(2, settings?.language || 'de-DE'), DayOfWeekModel.TUESDAY),
        new InputOptionModel(getWeekDayNameShort(3, settings?.language || 'de-DE'), DayOfWeekModel.WEDNESDAY),
        new InputOptionModel(getWeekDayNameShort(4, settings?.language || 'de-DE'), DayOfWeekModel.THURSDAY),
        new InputOptionModel(getWeekDayNameShort(5, settings?.language || 'de-DE'), DayOfWeekModel.FRIDAY),
        new InputOptionModel(getWeekDayNameShort(6, settings?.language || 'de-DE'), DayOfWeekModel.SATURDAY),
        new InputOptionModel(getWeekDayNameShort(0, settings?.language || 'de-DE'), DayOfWeekModel.SUNDAY)
    ];

    const [repetitionType, setRepetitionType] = React.useState<InputOptionModel<RepetitionType>>(getRepetitionTypeByAmount(workTransaction.repetition.repetitionAmount || null));

    const getRepetitionRateName = (repetitionRateType: RepetitionRateType) => {
        if ((workTransaction.repetition.repetitionRate || 1) === 1) {
            switch (repetitionRateType) {
                case RepetitionRateType.DAY:
                    return translate("day");
                case RepetitionRateType.WEEK:
                    return translate("week");
                case RepetitionRateType.MONTH:
                    return translate("month");
                case RepetitionRateType.YEAR:
                    return translate("year");
                default:
                    return translate("undefined");
            }
        } else {
            switch (repetitionRateType) {
                case RepetitionRateType.DAY:
                    return translate("days");
                case RepetitionRateType.WEEK:
                    return translate("weeks");
                case RepetitionRateType.MONTH:
                    return translate("months");
                case RepetitionRateType.YEAR:
                    return translate("years");
                default:
                    return translate("undefined");
            }
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

    const getEveryText = () => {
        if ((workTransaction.repetition.repetitionRate || 1) === 1) {
            switch (workTransaction.repetition.repetitionRateType) {
                case RepetitionRateType.DAY:
                    return translate("every-1");
                case RepetitionRateType.WEEK:
                    return translate("every-2");
                case RepetitionRateType.MONTH:
                    return translate("every-1");
                case RepetitionRateType.YEAR:
                    return translate("every-3");
                default:
                    return translate("every-1");
            }
        } else {
            return translate("every-4");
        }
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
                { repetitionType.value !== RepetitionType.ONETIME && <>
                    <InputBaseComponent
                        title={translate("repetition-rate")}
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
                                <span>{getEveryText()}</span>
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
                                            oldRepetition.repetitionDaysInWeek.sort((a, b) => {
                                                if (a === DayOfWeekModel.SUNDAY) {
                                                    return 1;
                                                } else if (b === DayOfWeekModel.SUNDAY) {
                                                    return -1;
                                                } else {
                                                    return a - b;
                                                }
                                            });
                                            return oldRepetition;
                                        })
                                    }}
                                    options={dayOfWeekOptions}
                                />
                            }
                        </div>
                    </InputBaseComponent>
                </>}
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
                    disabledWeekDays={workTransaction.repetition.repetitionRateType === RepetitionRateType.WEEK ? getDisabledWeekDays() : []}
                />
            </> }
        </>
    );
};

export default RepetitionTab;