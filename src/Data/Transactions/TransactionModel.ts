import { TransactionType } from './TransactionType'; // Assuming TransactionType is an enum or class
import { RepetitionModel } from './RepetitionModel';
import {formatDateToStandardString} from "../../Helper/DateHelper";
import {DBItem} from "../DBItem"; // Assuming RepetitionModel is a class

export class TransactionModel implements DBItem {
    uid: string;
    accountId: string;
    history: boolean;
    name: string;
    categoryUid: string | null;
    // Only used in creating new transactions with new transaction partners
    newCategory: string | null;
    transactionAmount: number | null;
    currencyCode: string;
    currencyRates: string;
    transactionType: TransactionType;
    transactionExecutorUid: string | null;
    // Only used in creating new transactions with new transaction partners
    newTransactionPartner: string | null;
    date: string;
    repetition: RepetitionModel;
    labels: string[];
    // Only used in creating new transactions with new transaction partners
    newLabels: string[];
    notes: string;

    constructor(name?: string, transactionAmount?: number | null, transactionExecutor?: string | null, date?: string) {
        this.uid = '';
        this.accountId = '';
        this.history = false;
        this.name = name || '';
        this.categoryUid = '';
        this.newCategory = null;
        this.transactionAmount = transactionAmount || null;
        this.currencyCode = 'EUR';
        this.currencyRates = '';
        this.transactionType = TransactionType.INCOME;
        this.transactionExecutorUid = transactionExecutor || null;
        this.newTransactionPartner = null;
        this.date = date || formatDateToStandardString(new Date());
        this.repetition = new RepetitionModel();
        this.labels = [];
        this.newLabels = [];
        this.notes = '';
    }
}