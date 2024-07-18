import React, {useEffect} from 'react';
import {SortType} from "../../../Data/EnumTypes/SortType";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import {calculateNFutureTransactions, groupTransactions} from "../../../Helper/TransactionHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useDatabaseRoute} from "../../../CustomHooks/Database/useDatabaseRoute";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import DebtGroup from "./DebtGroup/DebtGroup";
import {usePayedDebts} from "../../../CustomHooks/Database/usePayedDebts";
import {getTransactionAmount} from "../../../Helper/CurrencyHelper";

const DebtScreen = ({
    searchValue,
    sortValue,
    filterValue,
}: {
    searchValue: string,
    sortValue: SortType,
    filterValue: FilterModel
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [debtGroups, setDebtGroups] = React.useState<DebtGroupModel[] | null>(null)

    useEffect(() => {
        if (!currentAccount) return

        let filteredDebts = []

        if (debts === null || payedDebts === null) {
            setDebtGroups(null)
            return
        }

        //Search
        filteredDebts = debts.filter((debt) => debt.name.toLowerCase().includes(searchValue.toLowerCase()))
        filteredDebts = [...filteredDebts, ...payedDebts.map((payedDebt) => {
            const payerName = transactionPartners?.find(tp => tp.uid === payedDebt.whoHasPaidUid)?.name || "Unknown"
            const receiverName = transactionPartners?.find(tp => tp.uid === payedDebt.whoWasPaiFor[0])?.name || "Unknown"

            return {
                ...payedDebt,
                name: translate("money-transfer"),
                subName: translate("money-transfer-from-to", payerName, receiverName),
                icon: "money-transfer"
            }
        })]

        //Sort
        const sortDebts = (debts: DebtModel[]) => {
            switch (sortValue) {
                case SortType.NEWEST_FIRST:
                    debts.sort((a, b) => {
                        return new Date(a.date) > new Date(b.date) ? 1 : -1;
                    })
                    break;
                case SortType.PRICE_HIGH_TO_LOW:
                    debts.sort((a, b) => {
                        return (a.transactionAmount || 0) < getTransactionAmount(b, currentAccount.currencyCode) ? 1 : -1;
                    })
                    break;
                case SortType.PRICE_LOW_TO_HIGH:
                    debts.sort((a, b) => {
                        return (a.transactionAmount || 0) > getTransactionAmount(b, currentAccount.currencyCode) ? 1 : -1;
                    })
                    break;
            }
        }

        //Filter
        filteredDebts = filteredDebts.filter((debt) => {
            if (filterValue.searchName) {
                if (!debt.name.toLowerCase().includes(filterValue.searchName.toLowerCase())) {
                    return false
                }
            }
            if (filterValue.transactionPartners && filterValue.transactionPartners.length > 0) {
                if (!filterValue.transactionPartners.includes(debt.transactionExecutorUid!)) {
                    return false
                }
            }
            if (filterValue.categories && filterValue.categories.length > 0) {
                if (!filterValue.categories.includes(debt.categoryUid!)) {
                    return false
                }
            }
            if (filterValue.labels && filterValue.labels.length > 0) {
                if (!filterValue.labels.some((label) => debt.labels?.includes(label))) {
                    return false
                }
            }
            if (filterValue.dateRange) {
                if (new Date(debt.date) < new Date(filterValue.dateRange.startDate) || new Date(debt.date) > new Date(filterValue.dateRange.endDate)) {
                    return false
                }
            }
            if (filterValue.priceRange) {
                if ((debt.transactionAmount || 0) < filterValue.priceRange.minPrice || (debt.transactionAmount || 0) > filterValue.priceRange.maxPrice) {
                    return false
                }
            }

            return true
        })

        // Group
        if (filteredDebts.length <= 0) {
            setDebtGroups([])
            return
        }

        sortDebts(filteredDebts)

        setDebtGroups(groupTransactions(
            filteredDebts,
            (date, debts) => {
                return new DebtGroupModel(date, debts as DebtModel[])
            },
            (debts) => {
                sortDebts(debts as DebtModel[])
            }
        ) as DebtGroupModel[]);
    }, [debts, payedDebts, currentAccount, searchValue, sortValue, filterValue]);

    return (
        <div className="list-screen">
            <div className="screen-list-items">
                { debtGroups ? (
                    debtGroups.length > 0 ? <>
                        {
                            debtGroups.map((debtGroup, index) => (
                                <DebtGroup
                                    key={index}
                                    debtGroup={debtGroup}
                                    transactionPartners={transactionPartners}
                                />
                            ))
                        }
                    </> : <span className="no-items">{translate("no-transactions-found")}</span>
                ) : <Spinner type={SpinnerType.CYCLE} /> }
            </div>
        </div>
    );
};

export default DebtScreen;