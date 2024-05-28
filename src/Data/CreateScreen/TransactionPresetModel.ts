import {TransactionModel} from "../Transactions/TransactionModel";
import {DBItem} from "../DBItem";
import uuid from "react-uuid";

export class TransactionPresetModel implements DBItem {
    uid: string;
    icon: string | null;
    presetTransaction: TransactionModel;

    constructor(icon?: string, presetTransaction?: TransactionModel) {
        this.uid = uuid();
        this.icon = icon || null;
        this.presetTransaction = presetTransaction || new TransactionModel();
    }
}