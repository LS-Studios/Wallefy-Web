import {DateRangeModel} from "../Data/DataModels/DateRangeModel";
import exp from "constants";

export function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function formatDate(date: Date, locale: string) {
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
}

export function formatTime(date: Date, locale: string) {
    return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export const getCurrentDate = () => {
    const date = new Date()
    date.setHours(2, 0, 0, 0)
    return date
}

export const speakableDate = (date: Date, langKey: string, translate: (string: string) => string) => {
    return getWeekDayNameLong(date.getDay(), langKey) + " " + translate("the") + " " + formatDate(date, langKey)
}

export const getWeekDayNameLong = (day: number, langKey: string) => {
    return new Date(0, 0, day).toLocaleDateString(langKey, {weekday: "long"})
}

export const getWeekDayNameShort = (day: number, langKey: string, option: string = "long") => {
    return new Date(0, 0, day).toLocaleDateString(langKey, {weekday: "short"})
}

export function formatDateToStandardString(date: Date) {
    return [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
    ].join('-');
}

export const getStartOfWeekDayValue = (date: Date) => {
    date = new Date(date)
    const day = date.getDay()
    const firstDay = date.getDate() - day + (day == 0 ? -6:1) // adjust when day is sunday cause it starts with 0 on sunday
    return firstDay
}

export const getMonthName = (date: Date, langKey: string) => {
    return date.toLocaleDateString(langKey, {month: 'long'})
}

export const getMonthAndYear = (date: Date, langKey: string) => {
    return getMonthName(date, langKey) + " " + date.getFullYear()
}

export const getStartOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const getEndOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export const dateRangeIsMonth = (dateRange: DateRangeModel) => {
    return dateRange.startDate === formatDateToStandardString(getStartOfMonth(new Date(dateRange.startDate)))
        && dateRange.endDate === formatDateToStandardString(getEndOfMonth(new Date(dateRange.startDate)))
}

export function addDays(transactionDate: Date, days: number) {
    const result = new Date(transactionDate)
    result.setDate(result.getDate() + days);
    return result;
}

export function addWeeks(transactionDate: Date, weeks: number) {
    return addDays(transactionDate, weeks * 7);
}

export function addMonths(transactionDate: Date, months: number) {
    const result = new Date(transactionDate)
    result.setMonth(result.getMonth() + months);
    return result;
}

export function addYears(transactionDate: Date, years: number) {
    const result = new Date(transactionDate)
    result.setFullYear(result.getFullYear() + years);
    return result
}

export function speakableDateRange(dateRange: DateRangeModel, langKey: string) {
    return dateRangeIsMonth(dateRange) ? getMonthAndYear(new Date(dateRange.startDate), "DE") : `${formatDate(new Date(dateRange.startDate), langKey)} - ${formatDate(new Date(dateRange.endDate), langKey)}`
}