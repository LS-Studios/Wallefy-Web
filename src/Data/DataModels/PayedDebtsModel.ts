export class PayedDebtsModel {
    payedToUid: string;
    debts: string[];

    constructor(payedToUid: string, debts: string[]) {
        this.payedToUid = payedToUid;
        this.debts = debts;
    }
}