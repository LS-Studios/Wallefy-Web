import React, {useEffect} from 'react';
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {TransactionGroupModel} from "../../../Data/DataModels/TransactionGroupModel";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {calculateNFutureTransactions, groupTransactions} from "../../../Helper/TransactionHelper";
import {getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useTransactions} from "../../../CustomHooks/useTransactions";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {getDataSetPath} from "acebase/dist/types/test/dataset";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import {useHistoryTransactions} from "../../../CustomHooks/useHistoryTransactions";
import {useDebts} from "../../../CustomHooks/useDebts";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import TransactionGroup from "../Transactions/TransactionGroup/TransactionGroup";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import DebtGroup from "./DebtGroup/DebtGroup";

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
    const getDatabaseRoute = useDatabaseRoute()
    const currentAccount = useCurrentAccount()

    const debts = useDebts()
    const transactionPartners = useTransactionPartners()

    const [debtGroups, setDebtGroups] = React.useState<DebtGroupModel[] | null>(null)

    useEffect(() => {
        if (!currentAccount) return

        let filteredDebts = []

        if (debts === null) {
            setDebtGroups(null)
            return
        }

        //Search
        filteredDebts = debts.filter((debt) => debt.name.toLowerCase().includes(searchValue.toLowerCase()))

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
                        return (a.transactionAmount || 0) < (b.transactionAmount || 0) ? 1 : -1;
                    })
                    break;
                case SortType.PRICE_LOW_TO_HIGH:
                    debts.sort((a, b) => {
                        return (a.transactionAmount || 0) > (b.transactionAmount || 0) ? 1 : -1;
                    })
                    break;
            }
        }

        //Filter
        filteredDebts = filteredDebts.filter((debt) => {
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
    }, [debts, currentAccount, searchValue, sortValue, filterValue]);

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
                                    settings={settings}
                                    translate={translate}
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