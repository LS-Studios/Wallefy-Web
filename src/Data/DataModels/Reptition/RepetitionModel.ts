import {ExecutionType} from "../../EnumTypes/ExecutionType";
import {RepetitionRateType} from "../../EnumTypes/RepetitionRateType";
import {DayOfWeekModel} from "./DayOfWeekModel";

export class RepetitionModel {
    executionType: ExecutionType;
    repetitionAmount: number | null;
    repetitionRateType: RepetitionRateType;
    repetitionRate: number | null;
    repetitionDaysInWeek: DayOfWeekModel[];

    isPending: boolean;
    isPaused: boolean;

    constructor(
        executionType: ExecutionType = ExecutionType.NOW,
        repetitionAmount: number | null = null,
        repetitionRateType: RepetitionRateType = RepetitionRateType.DAY,
        repetitionRate: number | null = null,
        repetitionDaysInWeek: DayOfWeekModel[] = [DayOfWeekModel.MONDAY],
        isPending: boolean = false,
        isPaused: boolean = false,
    ) {
        this.executionType = executionType;
        this.repetitionAmount = repetitionAmount;
        this.repetitionRateType = repetitionRateType;
        this.repetitionRate = repetitionRate;
        this.repetitionDaysInWeek = repetitionDaysInWeek;
        this.isPending = isPending;
        this.isPaused = isPaused;
    }
}