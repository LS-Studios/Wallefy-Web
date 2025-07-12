import {TransactionModel} from "../DatabaseModels/TransactionModel";
import {DebtModel} from "../DatabaseModels/DebtModel";
import Debt from "../../UI/Screens/Debts/Debt/Debt";

export class DebtGroupModel {
    date: string;
    debts: DebtModel[];
    isStartOfMonth: boolean = false;

    constructor(date: string, debts: DebtModel[], isStartOfMonth: boolean = false) {
        this.date = date;
        this.debts = debts;
        this.isStartOfMonth = isStartOfMonth;
    }
}