import React, {useState} from 'react';
import {MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import TransactionsScreen from "./TransactionsScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import FilterTransactionsDialog from "../../Dialogs/SortTransactionsDialog/FilterTransactionsDialog";
import {DialogModel} from "../../../Data/Providers/DialogModel";
import {SortType} from "../../../Data/SortType";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import {FilterModel} from "../../../Data/FilterModel";
import SortTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/SortTransactionsDialog";

const TransactionsOverlay = () => {
    const dialog = useDialog()

    const sortTypeOptions = [
        new InputOptionModel("Newest first", SortType.NEWEST_FIRST),
        new InputOptionModel("Price low to high", SortType.PRICE_LOW_TO_HIGH),
        new InputOptionModel("Price high to low", SortType.PRICE_HIGH_TO_LOW),
    ];

    const [searchValue, setSearchValue] = useState<string>("")
    const [sortValue, setSortValue] = useState<SortType>(SortType.NEWEST_FIRST);
    const [filterValue, setFilterValue] = useState<FilterModel>(new FilterModel())

    return (
        <ContentOverlay
            title="Transactions"
            titleIcon={<MdOutlineMonetizationOn />}
            actions={[
                new ContentSearchAction(
                    "Search for transactions",
                    (searchText) => {
                        setSearchValue(searchText);
                    }
                ),
                new ContentAction(
                    "Sort: " + sortTypeOptions.find((option) => option.value === sortValue)!.name,
                    () => {
                        dialog.open(
                            new DialogModel(
                                "Sort transactions",
                                <SortTransactionsDialog
                                    sortType={sortValue}
                                    onSortTypeChange={setSortValue}
                                />
                            )
                        )
                    },
                    false,
                    <MdSort />,
                ),
                new ContentAction(
                    "Filter",
                    () => {
                        dialog.open(
                            new DialogModel(
                                "Filter transactions",
                                <FilterTransactionsDialog
                                    currentFilter={filterValue}
                                    onFilterChange={setFilterValue}
                                />
                            )
                        )
                    },
                    false,
                    <MdTune />,
                )
            ]}>
            <TransactionsScreen searchValue={searchValue} sortValue={sortValue} filterValue={filterValue}/>
        </ContentOverlay>
    );
};

export default TransactionsOverlay;