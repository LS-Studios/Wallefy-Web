import {RepetitionRateType} from "../Data/Transactions/RepetitionRateType";
import {formatDateToStandardString, getWeekDayNameShort} from "./DateHelper";
import {DayOfWeekModel} from "../Data/Transactions/DayOfWeekModel";
import {RepetitionModel} from "../Data/Transactions/RepetitionModel";
import {deleteDBItem, deleteDBItemByUid} from "./AceBaseHelper";
import {DatabaseRoutes} from "./DatabaseRoutes";
import {TransactionModel} from "../Data/Transactions/TransactionModel";

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

    calculateNextRepetitionDate(deleteFromDB: boolean = false): string | null {
        if (this.repetition.isPending || this.repetition.isPaused) {
            return this.transactionDate;
        }

        const newRepetitionAmount = !this.repetition.repetitionAmount ? null : this.repetition.repetitionAmount - 1

        let newRepetitionDate: string | null = null

        switch (this.repetition.repetitionRateType) {
            case RepetitionRateType.DAY:
                newRepetitionDate = this.addDays(this.transactionDate, this.repetition.repetitionRate || 1);
                break;
            case RepetitionRateType.WEEK:
                let nextDay = this.addDays(this.transactionDate, 1)

                while (!this.repetition.repetitionDaysInWeek.includes((new Date(nextDay).getDay()) as DayOfWeekModel)) {
                    nextDay = this.addDays(nextDay, 1)

                    if (this.repetition.repetitionRate && (new Date(nextDay).getDay()) === DayOfWeekModel.MONDAY) {
                        nextDay = this.addWeeks(nextDay, this.repetition.repetitionRate - 1)
                    }
                }
                newRepetitionDate = nextDay;
                break;
            case RepetitionRateType.MONTH:
                newRepetitionDate = this.addMonths(this.transactionDate, this.repetition.repetitionRate || 1);
                break;
            case RepetitionRateType.YEAR:
                newRepetitionDate = this.addYears(this.transactionDate, this.repetition.repetitionRate || 1);
                break;
        }

        if (deleteFromDB && newRepetitionAmount !== null && newRepetitionAmount === 0) {
            deleteDBItemByUid(DatabaseRoutes.TRANSACTIONS, this.transactionUid)
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

    private addDays(transactionDate: string, days: number) {
        const result = new Date(transactionDate)
        result.setDate(result.getDate() + days);
        return formatDateToStandardString(result);
    }

    private addWeeks(transactionDate: string, weeks: number) {
        return this.addDays(transactionDate, weeks * 7);
    }

    private addMonths(transactionDate: string, months: number) {
        const result = new Date(transactionDate)
        result.setMonth(result.getMonth() + months);
        return formatDateToStandardString(result);
    }

    private addYears(transactionDate: string, years: number) {
        const result = new Date(transactionDate)
        result.setFullYear(result.getFullYear() + years);
        return formatDateToStandardString(result);
    }
}