export function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function formatDate(date: Date, locale: string = "de-DE") {
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
}

export const speakableDate = (date: Date) => {
    return getWeekDayNameLong(date.getDay(), "de-DE") + " der " + formatDate(date, "de-DE")
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