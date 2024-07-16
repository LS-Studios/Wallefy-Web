import { TransactionType } from '../EnumTypes/TransactionType'; // Assuming TransactionType is an enum or class
import { RepetitionModel } from '../DataModels/Reptition/RepetitionModel';
import {formatDateToStandardString} from "../../Helper/DateHelper";
import {DBItem} from "./DBItem";
import {CurrencyModel} from "../DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../Helper/CurrencyHelper";
import {SettingsModel} from "../DataModels/SettingsModel"; // Assuming RepetitionModel is a class

export class TransactionModel implements DBItem {
    uid: string;
    accountUid: string;
    history: boolean;
    future: boolean;
    name: string;
    icon: string | null;
    categoryUid: string | null;
    categoryFallback: string | null;
    transactionAmount: number | null;
    currency: CurrencyModel;
    transactionType: TransactionType;
    transactionExecutorUid: string | null;
    transactionExecutorFallback: string | null;
    date: string;
    repetition: RepetitionModel;
    labels: string[];
    labelsFallback: { [uid: string]: string};
    notes: string;

    constructor(baseCurrency: string | null | undefined) {
        this.uid = '';
        this.accountUid = '';
        this.history = false;
        this.future = false;
        this.name ='';
        this.icon = null;
        this.categoryUid = '';
        this.categoryFallback = null;
        this.transactionAmount = null;
        this.currency = getDefaultCurrency(baseCurrency);
        this.transactionType = TransactionType.INCOME;
        this.transactionExecutorUid = null;
        this.transactionExecutorFallback = null;
        this.date = formatDateToStandardString(new Date());
        this.repetition = new RepetitionModel();
        this.labels = [];
        this.labelsFallback = {};
        this.notes = '';
    }
}