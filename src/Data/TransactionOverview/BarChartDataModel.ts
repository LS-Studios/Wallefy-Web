export class BarChartDataModel {
    label: string;
    value: number;
    color: string;

    constructor(label: string, value: number, color: string) {
        this.label = label;
        this.value = value;
        this.color = color;
    }
}