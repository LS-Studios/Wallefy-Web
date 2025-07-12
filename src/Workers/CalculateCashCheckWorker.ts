/* eslint-disable no-restricted-globals */

import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {calculateBalances, calculateCashChecks} from "../Helper/CalculationHelper";

export type CalculateCashCheckWorkerData = {
    debts: DebtModel[];
    payedDebts: DebtModel[];
    baseCurrency: string;
}

self.onmessage = (e: MessageEvent<string>) => {
    const { debts, payedDebts, baseCurrency }: CalculateCashCheckWorkerData = JSON.parse(e.data)

    self.postMessage(calculateCashChecks(debts, payedDebts, baseCurrency))
};

export {};