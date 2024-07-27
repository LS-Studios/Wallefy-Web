import React from 'react';
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {RepetitionRateType} from "../../../../Data/EnumTypes/RepetitionRateType";
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
import {DayOfWeekModel} from "../../../../Data/DataModels/Reptition/DayOfWeekModel";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";
import {RepetitionModel} from "../../../../Data/DataModels/Reptition/RepetitionModel";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {getWeekDayNameShort} from "../../../../Helper/DateHelper";
import {useSettings} from "../../../../Providers/SettingsProvider";

const RepetitionRateInput = ({
    title,
    repetition,
    updateRepetition,
 } : {
    title: string,
    repetition: RepetitionModel,
    updateRepetition: (updater: (oldRepetition: RepetitionModel) => RepetitionModel) => void
}) => {
    const translate = useTranslation();
    const settings = useSettings()

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

    const getEveryText = () => {
        if ((repetition.repetitionRate || 1) === 1) {
            switch (repetition.repetitionRateType) {
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

    const getRepetitionRateName = (repetitionRateType: RepetitionRateType) => {
        if ((repetition.repetitionRate || 1) === 1) {
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

    return (
        <InputBaseComponent
            title={title}
        >
            <div className="create-transaction-dialog-repetition-amount">
                <RadioInputComponent
                    value={repetitionRateTypeOptions.find(option => option.value === repetition.repetitionRateType)!}
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
                        value={repetition.repetitionRate}
                        onValueChange={(value) => {
                            updateRepetition((oldRepetition) => {
                                oldRepetition.repetitionRate = value as number | null;
                                return oldRepetition;
                            })
                        }}
                        type="number"
                        placeholder="1"
                    />
                    <span>{getRepetitionRateName(repetition.repetitionRateType)}</span>
                </div>
                {repetition.repetitionRateType === RepetitionRateType.WEEK &&
                    <RadioInputComponent
                        value={(repetition.repetitionDaysInWeek || []).map((dayOfWeek) => dayOfWeekOptions.find(option => option.value === dayOfWeek)!)}
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
    );
};

export default RepetitionRateInput;