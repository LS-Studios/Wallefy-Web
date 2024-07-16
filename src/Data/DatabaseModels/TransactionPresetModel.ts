import {TransactionModel} from "./TransactionModel";
import {DBItem} from "./DBItem";
import uuid from "react-uuid";
import {SettingsModel} from "../DataModels/SettingsModel";
import {PresetQuestionModel} from "../DataModels/PresetQuestionModel";

export class TransactionPresetModel implements DBItem {
    uid: string;
    accountId: string
    icon: string | null;
    presetItem: TransactionModel;
    name: string = "";
    presetQuestions: PresetQuestionModel<TransactionModel>[]

    constructor(accountId: string, icon: string, name: string, presetItem: TransactionModel, baseCurrency: string | null | undefined, presetQuestions: PresetQuestionModel<TransactionModel>[], uid?: string) {
        this.accountId = accountId;
        this.uid = uid || uuid();
        this.name = name;
        this.icon = icon || null;
        this.presetItem = presetItem || new TransactionModel(baseCurrency);
        this.presetQuestions = presetQuestions;
    }
}