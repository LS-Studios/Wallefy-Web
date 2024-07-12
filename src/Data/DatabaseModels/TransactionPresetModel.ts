import {TransactionModel} from "./TransactionModel";
import {DBItem} from "./DBItem";
import uuid from "react-uuid";
import {SettingsModel} from "../DataModels/SettingsModel";

export class TransactionPresetModel implements DBItem {
    uid: string;
    accountId: string
    icon: string | null;
    presetTransaction: TransactionModel;
    name: string = "";

    constructor(accountId: string, icon: string, name: string, presetTransaction: TransactionModel, baseCurrency: string | null | undefined, uid?: string) {
        this.accountId = accountId;
        this.uid = uid || uuid();
        this.name = name;
        this.icon = icon || null;
        this.presetTransaction = presetTransaction || new TransactionModel(baseCurrency);
    }
}