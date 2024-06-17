import {ExecutionType} from "./ExecutionType";
import {RepetitionRateType} from "./RepetitionRateType";
import {DayOfWeekModel} from "./DayOfWeekModel";

export class RepetitionModel {
    executionType: ExecutionType;
    repetitionAmount: number | null;
    repetitionRateType: RepetitionRateType;
    repetitionRate: number | null;
    repetitionDaysInWeek: DayOfWeekModel[];

    isPending: boolean;
    isPaused: boolean;

    constructor() {
        this.executionType = ExecutionType.NOW;
        this.repetitionAmount = null;
        this.repetitionRateType = RepetitionRateType.DAY;
        this.repetitionRate = null;
        this.repetitionDaysInWeek = [DayOfWeekModel.MONDAY];
        this.isPending = false;
        this.isPaused = false;
    }
}