import {TransactionPartnerModel} from "../DatabaseModels/TransactionPartnerModel";
import {LabelModel} from "../DatabaseModels/LabelModel";
import {CategoryModel} from "../DatabaseModels/CategoryModel";

export class CreateDialogNewItems {
    newTransactionPartners: TransactionPartnerModel[];
    newLabels: LabelModel[];
    newCategories: CategoryModel[];

    constructor() {
        this.newTransactionPartners = [];
        this.newLabels = [];
        this.newCategories = [];
    }
}