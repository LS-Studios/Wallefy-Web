import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {CashCheckModel} from "../Data/DataModels/CashCheckModel";
import {getTransactionAmount} from "./CurrencyHelper";
import {BalanceModel} from "../Data/DataModels/BalanceModel";
import {TransactionPartnerModel} from "../Data/DatabaseModels/TransactionPartnerModel";

export function roundToNearest(value: number, precision: number = 0.01): number {
    const decimalPlaces = precision.toString().split('.')[1]?.length || 0;
    const roundedValue = value / precision;
    if (roundedValue >= 0) {
        return cutOffDecimals(Math.round(roundedValue) * precision, decimalPlaces);
    } else {
        return cutOffDecimals(-Math.round(-roundedValue) * precision, decimalPlaces);
    }
}

function cutOffDecimals(value: number, decimalsToKeep: number = 2): number {
    return parseFloat(value.toFixed(decimalsToKeep));
}

export function calculateCashChecks(debts: DebtModel[], payedDebts: DebtModel[], baseCurrency: string) {
    const cashChecks: CashCheckModel[] = [];

    const balances = calculateBalances(debts, payedDebts, baseCurrency);

    const payers: [string, number][] = balances.filter(balance => balance.balance < 0).map(balance => [balance.transactionPartnerUid, balance.balance]);
    const receivers: [string, number][] = balances.filter(balance => balance.balance >= 0).map(balance => [balance.transactionPartnerUid, balance.balance]);

    let payerIndex = 0;
    let receiverIndex = 0;

    while (payerIndex < payers.length && receiverIndex < receivers.length) {
        let [payer, payerAmount] = payers[payerIndex];
        let [receiver, receiverAmount] = receivers[receiverIndex];
        let payment = Math.min(-payerAmount, receiverAmount); // Amount to settle between payer and receiver

        if (payment > 0) {
            cashChecks.push(
                new CashCheckModel(
                    payer,
                    receiver,
                    payment
                )
            );
        }

        payers[payerIndex][1] += payment;
        receivers[receiverIndex][1] -= payment;

        if (payers[payerIndex][1] === 0) {
            payerIndex++;
        }
        if (receivers[receiverIndex][1] === 0) {
            receiverIndex++;
        }
    }

    return cashChecks
}

export const calculateBalances = (debts: DebtModel[], payedDebts: DebtModel[], baseCurrency: string): BalanceModel[] => {
    const participantMap: { [key: string]: number } = {}

    debts.forEach((debt) => {
        if (debt.whoHasPaidUid)
            participantMap[debt.whoHasPaidUid] = (participantMap[debt.whoHasPaidUid] || 0) + getTransactionAmount(debt, baseCurrency)

        debt.distributions.forEach((distribution) => {
            participantMap[distribution.transactionPartnerUid] = (participantMap[distribution.transactionPartnerUid] || 0) - getTransactionAmount(debt, baseCurrency) * (distribution.percentage / 100)
        })
    })

    const newBalances: BalanceModel[] = []

    Object.keys(participantMap).forEach((key) => {
        const tpPayedDebts = payedDebts?.filter(payedDebt => payedDebt.whoHasPaidUid === key)
        const tpPayedDebtsAmount = tpPayedDebts?.reduce((acc, payedDebt) => acc + (payedDebt.transactionAmount || 0), 0)

        const tpReceiveDebts = payedDebts?.filter(payedDebt => payedDebt.whoWasPaiFor[0] === key)
        const tpReceiveDebtsAmount = tpReceiveDebts?.reduce((acc, payedDebt) => acc + (payedDebt.transactionAmount || 0), 0)

        let balance = roundToNearest(participantMap[key]) - roundToNearest(tpReceiveDebtsAmount || 0) + roundToNearest(tpPayedDebtsAmount || 0)

        newBalances.push(
            new BalanceModel(
                key,
                balance,
            )
        )
    })

    return newBalances
}