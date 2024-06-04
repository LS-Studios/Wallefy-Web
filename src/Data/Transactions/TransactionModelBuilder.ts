import {TransactionModel} from "./TransactionModel";
import {RepetitionModel} from "./RepetitionModel";
import {TransactionType} from "./TransactionType";

export class TransactionModelBuilder {
    private readonly model: TransactionModel;

    constructor() {
        this.model = new TransactionModel();
    }

    setUid(uid: string): TransactionModelBuilder {
        this.model.uid = uid;
        return this;
    }

    setAccountId(accountId: string): TransactionModelBuilder {
        this.model.accountId = accountId;
        return this;
    }

    setHistory(history: boolean): TransactionModelBuilder {
        this.model.history = history;
        return this;
    }

    setName(name: string): TransactionModelBuilder {
        this.model.name = name;
        return this;
    }

    setCategory(category: string): TransactionModelBuilder {
        this.model.categoryUid = category;
        this.model.newCategory = category;
        return this;
    }

    setTransactionAmount(transactionAmount: number | null): TransactionModelBuilder {
        this.model.transactionAmount = transactionAmount;
        return this;
    }

    setCurrencyCode(currencyCode: string): TransactionModelBuilder {
        this.model.currencyCode = currencyCode;
        return this;
    }

    setCurrencyRates(currencyRates: string): TransactionModelBuilder {
        this.model.currencyRates = currencyRates;
        return this;
    }

    setTransactionType(transactionType: TransactionType): TransactionModelBuilder {
        this.model.transactionType = transactionType;
        return this;
    }

    setTransactionExecutor(executor: string | null): TransactionModelBuilder {
        this.model.transactionExecutorUid = executor;
        this.model.newTransactionPartner = executor;
        return this;
    }

    setDate(date: string): TransactionModelBuilder {
        this.model.date = date;
        return this;
    }

    setRepetition(repetition: RepetitionModel): TransactionModelBuilder {
        this.model.repetition = repetition;
        return this;
    }

    setLabels(labels: string[]): TransactionModelBuilder {
        this.model.labels = labels;
        this.model.newLabels = labels;
        return this;
    }

    setNotes(notes: string): TransactionModelBuilder {
        this.model.notes = notes;
        return this;
    }

    build(): TransactionModel {
        return this.model;
    }
}