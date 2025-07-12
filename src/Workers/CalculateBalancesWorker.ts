/* eslint-disable no-restricted-globals */

import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {calculateBalances} from "../Helper/CalculationHelper";

export type CalculateBalancesWorkerData = {
    debts: DebtModel[];
    payedDebts: DebtModel[];
    baseCurrency: string;
}

self.onmessage = (e: MessageEvent<string>) => {
    const { debts, payedDebts, baseCurrency }: CalculateBalancesWorkerData = JSON.parse(e.data)

    self.postMessage(calculateBalances(debts, payedDebts, baseCurrency))
};

export {};