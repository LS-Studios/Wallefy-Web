import {PayedDebtsModel} from "./PayedDebtsModel";

export class PayedDebtModel {
    payerUid: string
    payedDebts: PayedDebtsModel

    constructor(payerUid: string, payedDebts: PayedDebtsModel) {
        this.payerUid = payerUid;
        this.payedDebts = payedDebts;
    }
}