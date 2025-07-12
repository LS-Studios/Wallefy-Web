import {TransactionModel} from "../DatabaseModels/TransactionModel";
import {TransactionPresetModel} from "../DatabaseModels/TransactionPresetModel";
import {CategoryModel} from "../DatabaseModels/CategoryModel";
import {TransactionPartnerModel} from "../DatabaseModels/TransactionPartnerModel";
import {LabelModel} from "../DatabaseModels/LabelModel";
import {DebtPresetModel} from "../DatabaseModels/DebtPresetModel";
import {DebtModel} from "../DatabaseModels/DebtModel";

export class ExportDataModel {
    presets: (TransactionPresetModel | DebtPresetModel)[];
    history: TransactionModel[];
    transactions: TransactionModel[];
    debts: DebtModel[];
    payedDebts: DebtModel[];
    categories: CategoryModel[];
    transactionPartners: TransactionPartnerModel[];
    labels: LabelModel[];

    constructor(presets: (TransactionPresetModel | DebtPresetModel)[], history: TransactionModel[], transactions: TransactionModel[], debts: DebtModel[], payedDebts: DebtModel[], categories: CategoryModel[], transactionPartners: TransactionPartnerModel[], labels: LabelModel[]) {
        this.presets = presets;
        this.history = history;
        this.transactions = transactions;
        this.debts = debts;
        this.payedDebts = payedDebts
        this.categories = categories;
        this.transactionPartners = transactionPartners;
        this.labels = labels;
    }
}