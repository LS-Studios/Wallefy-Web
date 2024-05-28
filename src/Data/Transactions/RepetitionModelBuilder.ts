import {RepetitionModel} from "./RepetitionModel";
import {DayOfWeekModel} from "./DayOfWeekModel";
import {RepetitionRateType} from "./RepetitionRateType";
import {ExecutionType} from "./ExecutionType";

export class RepetitionModelBuilder {
    private readonly model: RepetitionModel;

    constructor() {
        this.model = new RepetitionModel();
    }

    setExecutionType(executionType: ExecutionType): RepetitionModelBuilder {
        this.model.executionType = executionType;
        return this;
    }

    setRepetitionAmount(amount: number | null): RepetitionModelBuilder {
        this.model.repetitionAmount = amount;
        return this;
    }

    setRepetitionRateType(type: RepetitionRateType): RepetitionModelBuilder {
        this.model.repetitionRateType = type;
        return this;
    }

    setRepetitionRate(rate: number | null): RepetitionModelBuilder {
        this.model.repetitionRate = rate;
        return this;
    }

    setRepetitionDaysInWeek(days: DayOfWeekModel[]): RepetitionModelBuilder {
        this.model.repetitionDaysInWeek = days;
        return this;
    }

    setIsPending(isPending: boolean): RepetitionModelBuilder {
        this.model.isPending = isPending;
        return this;
    }

    setIsPaused(isPaused: boolean): RepetitionModelBuilder {
        this.model.isPaused = isPaused;
        return this;
    }

    build(): RepetitionModel {
        return this.model;
    }
}