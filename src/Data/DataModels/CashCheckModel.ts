import {PayedDebtModel} from "./PayedDebtModel";
import {PayedDebtsModel} from "./PayedDebtsModel";

export class CashCheckModel {
    payerUid: string;
    receiverUid: string;
    amount: number;
    payedDebts: PayedDebtsModel;

    constructor(payerUid: string, receiverUid: string, amount: number, payedDebts: PayedDebtsModel) {
        this.payerUid = payerUid;
        this.receiverUid = receiverUid;
        this.amount = amount;
        this.payedDebts = payedDebts;
    }
}