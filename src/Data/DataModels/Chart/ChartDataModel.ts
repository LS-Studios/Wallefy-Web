export class ChartDataModel {
    label: string;
    value: number;
    color: string | null;

    constructor(label: string, value: number, color: string | null = null) {
        this.label = label;
        this.value = value;
        this.color = color;
    }
}