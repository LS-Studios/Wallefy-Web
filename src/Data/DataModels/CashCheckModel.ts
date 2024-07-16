import {DBItem} from "../DatabaseModels/DBItem";

export class CashCheckModel implements DBItem {
    uid: string = ""
    payerUid: string
    receiverUid: string
    amount: number


    name: string = ""

    constructor(payerUid: string, receiverUid: string, amount: number) {
        this.payerUid = payerUid
        this.receiverUid = receiverUid
        this.amount = amount
    }
}