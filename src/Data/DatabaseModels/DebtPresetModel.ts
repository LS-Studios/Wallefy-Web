import {TransactionModel} from "./TransactionModel";
import {DBItem} from "./DBItem";
import uuid from "react-uuid";
import {SettingsModel} from "../DataModels/SettingsModel";
import {DebtModel} from "./DebtModel";

export class DebtPresetModel implements DBItem {
    uid: string;
    accountId: string
    icon: string | null;
    presetDebt: DebtModel;
    name: string = "";

    constructor(accountId: string, icon: string, name: string, presetDebt: DebtModel, baseCurrency: string | null | undefined, uid?: string) {
        this.accountId = accountId;
        this.uid = uid || uuid();
        this.name = name;
        this.icon = icon || null;
        this.presetDebt = presetDebt || new DebtModel(baseCurrency);
    }
}