import {TransactionModel} from "../Transactions/TransactionModel";
import {DBItem} from "../DBItem";
import uuid from "react-uuid";

export class TransactionPresetModel implements DBItem {
    uid: string;
    icon: string | null;
    presetTransaction: TransactionModel;
    name: string = "";

    constructor(icon: string, name: string, presetTransaction: TransactionModel, uid?: string) {
        this.uid = uid || uuid();
        this.name = name;
        this.icon = icon || null;
        this.presetTransaction = presetTransaction || new TransactionModel();
    }
}