import { TransactionType } from '../EnumTypes/TransactionType';
import { RepetitionModel } from '../DataModels/Reptition/RepetitionModel';
import {formatDateToStandardString} from "../../Helper/DateHelper";
import {DBItem} from "./DBItem";
import {CurrencyModel} from "../DataModels/CurrencyModel";
import {getDefaultCurrency} from "../../Helper/CurrencyHelper";
import {DistributionModel} from "../DataModels/DistributionModel";

export class DebtModel implements DBItem {
    uid: string;
    accountId: string;
    name: string;
    categoryUid: string | null;
    categoryFallback: string | null;
    transactionAmount: number | null;
    currency: CurrencyModel;
    transactionExecutorUid: string | null;
    transactionExecutorFallback: string | null;
    whoHasPaidUid: string | null;
    whoHasPaidFallback: string | null;
    whoWasPaiFor: string[];
    whoWasPaiForFallback: string[];
    distributions: DistributionModel[];
    date: string;
    labels: string[];
    labelsFallback: string[];
    notes: string;

    constructor(baseCurrency: string | null | undefined) {
        this.uid = '';
        this.accountId = '';
        this.name ='';
        this.categoryUid = '';
        this.categoryFallback = null;
        this.transactionAmount = null;
        this.currency = getDefaultCurrency(baseCurrency);
        this.transactionExecutorUid = null;
        this.transactionExecutorFallback = null;
        this.whoHasPaidUid = null;
        this.whoHasPaidFallback = null;
        this.whoWasPaiFor = [];
        this.whoWasPaiForFallback = [];
        this.date = formatDateToStandardString(new Date());
        this.distributions = []
        this.labels = [];
        this.labelsFallback = [];
        this.notes = '';

        //TODO add new locic but as fallback with fallback labels and so on
    }
}