    import React, {useEffect, useState} from 'react';
import {MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import DebtScreen from "./DebtScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import FilterTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/FilterTransactionsDialog";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import OptionDialog from "../../Dialogs/OptionDialog/OptionDialog";
    import {useTranslation} from "../../../CustomHooks/useTranslation";
    import {useCurrentAccount} from "../../../Providers/AccountProvider";
    import {AccountType} from "../../../Data/EnumTypes/AccountType";

const DebtOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog()
    const { currentAccount } = useCurrentAccount();

    const sortTypeOptions = [
        new InputOptionModel(translate("newest-first"), SortType.NEWEST_FIRST),
        new InputOptionModel(translate("price-low-to-high"), SortType.PRICE_LOW_TO_HIGH),
        new InputOptionModel(translate("price-high-to-low"), SortType.PRICE_HIGH_TO_LOW),
    ];

    const [sortValue, setSortValue] = useState<SortType>(SortType.NEWEST_FIRST);
    const [filterValue, setFilterValue] = useState<FilterModel>(new FilterModel())

    const sortOptions = [
        new InputOptionModel(translate("newest-first"), SortType.NEWEST_FIRST),
        new InputOptionModel(translate("price-low-to-high"), SortType.PRICE_LOW_TO_HIGH),
        new InputOptionModel(translate("price-high-to-low"), SortType.PRICE_HIGH_TO_LOW),
    ]

    const getNumberOfActiveFilters = () => {
        let count = 0;
        for (const key in filterValue) {
            if (filterValue[key as keyof FilterModel] !== null) {
                count++;
            }
        }
        return count;
    }

    return (
        <ContentOverlay
            title={translate("transactions")}
            titleIcon={<MdOutlineMonetizationOn />}
            actions={[
                new ContentAction(
                    translate("sort") + ": " + sortTypeOptions.find((option) => option.value === sortValue)!.name,
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("sort-transactions"),
                                <OptionDialog
                                    currentOption={sortOptions.find((option) => option.value === sortValue)!}
                                    onOptionChange={(sortOption) => setSortValue(sortOption.value)}
                                    options={sortOptions}
                                />
                            )
                        )
                    },
                    false,
                    false,
                    <MdSort />,
                ),
                new ContentAction(
                    translate("filter") + (getNumberOfActiveFilters() > 0 ? " (" + getNumberOfActiveFilters() + ")" : ""),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("filter-transactions"),
                                <FilterTransactionsDialog
                                    currentFilter={filterValue}
                                    onFilterChange={setFilterValue}
                                    isDebt={currentAccount?.type === AccountType.DEBTS}
                                />
                            )
                        )
                    },
                    false,
                    false,
                    <MdTune />,
                )
            ]}>
            <DebtScreen sortValue={sortValue} filterValue={filterValue}/>
        </ContentOverlay>
    );
};

export default DebtOverlay;