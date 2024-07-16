import {PresetQuestionType} from "../EnumTypes/PresetQuestionType";
import {TransactionModel} from "../DatabaseModels/TransactionModel";
import {DebtPresetModel} from "../DatabaseModels/DebtPresetModel";
import {DBItem} from "../DatabaseModels/DBItem";
import {TransactionPartnerModel} from "../DatabaseModels/TransactionPartnerModel";
import {DebtModel} from "../DatabaseModels/DebtModel";
import uuid from "react-uuid";

export class PresetQuestionModel<T extends TransactionModel | DebtModel> {
    uid: string;
    question: string;
    questionType: PresetQuestionType;
    answerKey: keyof T

    constructor(question: string, questionType: PresetQuestionType, answerKey: keyof T) {
        this.uid = uuid()
        this.question = question;
        this.questionType = questionType;
        this.answerKey = answerKey;
    }
}