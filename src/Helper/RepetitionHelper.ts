import {RepetitionRateType} from "../Data/EnumTypes/RepetitionRateType";
import {
    addDays,
    addMonths,
    addWeeks,
    addYears,
    formatDate,
    formatDateToStandardString,
    getWeekDayNameShort
} from "./DateHelper";
import {DayOfWeekModel} from "../Data/DataModels/Reptition/DayOfWeekModel";
import {RepetitionModel} from "../Data/DataModels/Reptition/RepetitionModel";
import {deleteDBItem, deleteDBItemByUid} from "./AceBaseHelper";
import {DatabaseRoutes} from "./DatabaseRoutes";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";

export class RepetitionHelper {
    transactionUid: string;
    repetition: RepetitionModel;
    transactionDate: string;

    private endings2 = ['ten', 'te', 'ten', 'tes']
    private endings3 = ['ten', 'te', 'ten', 'tes']
    private endings4 = ['ten', 'te', 'ten', 'tes']

    private dayShorts = [
        getWeekDayNameShort(0, 'de-DE'),
        getWeekDayNameShort(1, 'de-DE'),
        getWeekDayNameShort(2, 'de-DE'),
        getWeekDayNameShort(3, 'de-DE'),
        getWeekDayNameShort(4, 'de-DE'),
        getWeekDayNameShort(5, 'de-DE'),
        getWeekDayNameShort(6, 'de-DE'),
    ]

    constructor(transaction: TransactionModel) {
        this.transactionUid = transaction.uid;
        this.repetition = transaction.repetition;
        this.transactionDate = transaction.date;
    }

    toSpeakableText(): string {
        const every = this.getRepetitionRateEveryText();

        const endig = this.getRepetitionRateEndingText();

        const repetitionRate = ((this.repetition.repetitionRate || 1) > 1) ? `${this.repetition.repetitionRate}${endig} ` : '';

        const typeSpan = this.getRepetitionTypePluralText(1)

        let weekDays = ` (${this.repetition.repetitionDaysInWeek.map(day => this.dayShorts[day]).join(', ')})`;

        if (this.repetition.repetitionRateType !== RepetitionRateType.WEEK) weekDays = '';

        const times = (this.repetition.repetitionAmount || 1) > 1 ? 'mal' : 'mal';

        if (this.repetition.repetitionAmount === 1) {
            return `Einmal`;
        } else if (!this.repetition.repetitionAmount) {
            return `${every} ${repetitionRate}${typeSpan}${weekDays}`;
        } else {
            return `${this.repetition.repetitionAmount} ${times}, ${every} ${repetitionRate}${typeSpan}${weekDays}`;
        }
    }

    calculateNextRepetitionDate(getDatabaseRoute: (databaseRoute: DatabaseRoutes) => string, ignorePausedOrPending: boolean = false, deleteFromDB: boolean = false): string | null {
        if (!ignorePausedOrPending && (this.repetition.isPending || this.repetition.isPaused)) {
            return null;
        }

        const newRepetitionAmount = !this.repetition.repetitionAmount ? null : this.repetition.repetitionAmount - 1

        let newRepetitionDate: string | null = null

        switch (this.repetition.repetitionRateType) {
            case RepetitionRateType.DAY:
                newRepetitionDate = formatDateToStandardString(
                    addDays(new Date(this.transactionDate), this.repetition.repetitionRate || 1)
                );
                break;
            case RepetitionRateType.WEEK:
                let nextDay = formatDateToStandardString(
                    addDays(new Date(this.transactionDate), 1)
                )

                while (!this.repetition.repetitionDaysInWeek.includes((new Date(nextDay).getDay()) as DayOfWeekModel)) {
                    nextDay = formatDateToStandardString(
                        addDays(new Date(nextDay), 1)
                    )

                    if (this.repetition.repetitionRate && (new Date(nextDay).getDay()) === DayOfWeekModel.MONDAY) {
                        nextDay = formatDateToStandardString(
                            addWeeks(new Date(nextDay), this.repetition.repetitionRate - 1)
                        )
                    }
                }
                newRepetitionDate = nextDay;
                break;
            case RepetitionRateType.MONTH:
                newRepetitionDate = formatDateToStandardString(
                    addMonths(new Date(this.transactionDate), this.repetition.repetitionRate || 1)
                )
                break;
            case RepetitionRateType.YEAR:
                newRepetitionDate =
                    formatDateToStandardString(
                        addYears(new Date(this.transactionDate), this.repetition.repetitionRate || 1)
                    )
                break;
        }

        if (deleteFromDB && newRepetitionAmount !== null && newRepetitionAmount === 0) {
            deleteDBItemByUid(
                getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
                this.transactionUid
            )
        }

        if (newRepetitionAmount !== null && newRepetitionAmount <= 0) return null;

        this.repetition.repetitionAmount = newRepetitionAmount;

        return newRepetitionDate
    }

    private getRepetitionTypePluralText = (count: number) => {
        switch (this.repetition.repetitionRateType) {
            case RepetitionRateType.DAY:
                return count > 1 ? 'Tage' : 'Tag';
            case RepetitionRateType.WEEK:
                return count > 1 ? 'Wochen' : 'Woche';
            case RepetitionRateType.MONTH:
                return count > 1 ? 'Monate' : 'Monat';
            case RepetitionRateType.YEAR:
                return count > 1 ? 'Jahre' : 'Jahr';
        }
    }

    private getRepetitionRateEveryText = () => {
        switch (this.repetition.repetitionRateType) {
            case RepetitionRateType.DAY:
                return 'Jeden';
            case RepetitionRateType.WEEK:
                return 'Jede';
            case RepetitionRateType.MONTH:
                return 'Jeden';
            case RepetitionRateType.YEAR:
                return 'Jedes';
        }
    }

    private getRepetitionRateEndingText = () => {
        switch (this.repetition.repetitionRate) {
            case 1:
                return '';
            case 2:
                return this.endings2[this.repetition.repetitionRateType];
            case 3:
                return this.endings3[this.repetition.repetitionRateType];
            case 4:
                return this.endings4[this.repetition.repetitionRateType];
            default:
                return this.endings4[this.repetition.repetitionRateType];
        }
    }
}