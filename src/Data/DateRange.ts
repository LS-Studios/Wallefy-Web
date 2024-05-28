import {formatDateToStandardString} from "../Helper/DateHelper";

export class DateRange {
    startDate: string = formatDateToStandardString(new Date());
    endDate: string = formatDateToStandardString(new Date());

    constructor(startDate: string = formatDateToStandardString(new Date()), endDate: string = formatDateToStandardString(new Date())) {
        this.startDate = startDate;
        this.endDate = endDate;
    }
}