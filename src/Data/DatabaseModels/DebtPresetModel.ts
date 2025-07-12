import {TransactionModel} from "./TransactionModel";
import {DBItem} from "./DBItem";
import uuid from "react-uuid";
import {SettingsModel} from "../DataModels/SettingsModel";
import {DebtModel} from "./DebtModel";
import {PresetQuestionModel} from "../DataModels/PresetQuestionModel";

export class DebtPresetModel implements DBItem {
    uid: string;
    accountId: string
    icon: string | null;
    presetItem: DebtModel;
    name: string = "";
    presetQuestions: PresetQuestionModel<DebtModel>[]

    constructor(accountId: string, icon: string, name: string, presetItem: DebtModel, baseCurrency: string | null | undefined, presetQuestions: PresetQuestionModel<DebtModel>[], uid?: string) {
        this.accountId = accountId;
        this.uid = uid || uuid();
        this.name = name;
        this.icon = icon || null;
        this.presetItem = presetItem || new DebtModel(baseCurrency);
        this.presetQuestions = presetQuestions;
    }
}