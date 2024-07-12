import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {CashCheckModel} from "../Data/DataModels/CashCheckModel";
import {runInNewContext} from "node:vm";
import {PayedDebtModel} from "../Data/DataModels/PayedDebtModel";
import debt from "../UI/Screens/Debts/Debt/Debt";
import {PayedDebtsModel} from "../Data/DataModels/PayedDebtsModel";

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

export function calculateCashChecks(debts: DebtModel[], payedDebts: PayedDebtModel[]) {
    const participantMap: { [key: string]: number } = {}
    const balanceForDebtMap: { [debtUid: string]: { [transactionPartnerUid: string]: number } } = {}

    function setBalanceForDebtMap(debtUid: string, transactionPartnerUid: string, value: number) {
        if (!balanceForDebtMap[debtUid]) {
            balanceForDebtMap[debtUid] = {};
        }
        balanceForDebtMap[debtUid][transactionPartnerUid] = value;
    }

    debts.forEach((debt) => {
        if (debt.whoHasPaidUid)
            participantMap[debt.whoHasPaidUid] = (participantMap[debt.whoHasPaidUid] || 0) + (debt.transactionAmount || 0)

        debt.distributions.forEach((distribution) => {
            participantMap[distribution.transactionPartnerUid] = (participantMap[distribution.transactionPartnerUid] || 0) - (debt.transactionAmount || 0) * (distribution.percentage / 100)

            let value = (debt.transactionAmount || 0) * (distribution.percentage / 100)

            if (distribution.transactionPartnerUid === debt.whoHasPaidUid) {
                value = (debt.transactionAmount || 0) - value
            } else {
                value = -value
            }

            setBalanceForDebtMap(debt.uid, distribution.transactionPartnerUid, value)
        })
    })

    payedDebts.forEach((payedDebt) => {
        let alreadyPayed = 0
        payedDebt.payedDebts.debts.forEach((debtUid) => {
            alreadyPayed += balanceForDebtMap[debtUid][payedDebt.payerUid] || 0
        })
        participantMap[payedDebt.payedDebts.payedToUid] += alreadyPayed
        participantMap[payedDebt.payerUid] -= alreadyPayed
    })

    const payerEntries: [string, number][] = [];
    const receiverEntries: [string, number][] = [];

    for (const key in participantMap) {
        if (participantMap[key] >= 0) {
            receiverEntries.push([key, participantMap[key]]);
        } else {
            payerEntries.push([key, participantMap[key]]);
        }
    }

    payerEntries.sort((a, b) => a[1] - b[1]);
    receiverEntries.sort((a, b) => b[1] - a[1]);

    const payersMap: { [key: string]: number } = {}
    const receiversMap: { [key: string]: number } = {}

    for (const [key, value] of payerEntries) {
        payersMap[key] = value;
    }

    for (const [key, value] of receiverEntries) {
        receiversMap[key] = value;
    }

    const cashChecks: CashCheckModel[] = [];

    const payers = Object.entries(payersMap);
    const receivers = Object.entries(receiversMap);

    let payerIndex = 0;
    let receiverIndex = 0;

    while (payerIndex < payers.length && receiverIndex < receivers.length) {
        let [payer, payerAmount] = payers[payerIndex];
        let [receiver, receiverAmount] = receivers[receiverIndex];
        let payment = Math.min(-payerAmount, receiverAmount); // Amount to settle between payer and receiver

        cashChecks.push(
            new CashCheckModel(
                payer,
                receiver,
                payment,
                new PayedDebtsModel(
                    receiver,
                    debts.map(debt => debt.uid)
                )
            )
        );

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