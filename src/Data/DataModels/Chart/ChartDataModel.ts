export class ChartDataModel {
    valueUid: string;
    label: string;
    value: number;
    color: string | null;

    constructor(valueUid: string, label: string, value: number, color: string | null = null) {
        this.valueUid = valueUid;
        this.label = label;
        this.value = value;
        this.color = color;
    }
}