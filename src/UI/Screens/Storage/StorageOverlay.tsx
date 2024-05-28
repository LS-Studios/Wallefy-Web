import React, {useState} from 'react';
import {MdInventory, MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import StorageScreen from "./StorageScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import FilterTransactionsDialog from "../../Dialogs/SortTransactionsDialog/FilterTransactionsDialog";
import {DialogModel} from "../../../Data/Providers/DialogModel";
import {SortType} from "../../../Data/SortType";
import {InputOptionModel} from "../../../Data/Input/InputOptionModel";
import {FilterModel} from "../../../Data/FilterModel";
import SortTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/SortTransactionsDialog";

const StorageOverlay = () => {
    const dialog = useDialog()

    const [searchValue, setSearchValue] = useState<string>("")

    return (
        <ContentOverlay
            title="Storage"
            titleIcon={<MdInventory />}
            actions={[
                new ContentSearchAction(
                    "Search for transactions",
                    (searchText) => {
                        setSearchValue(searchText);
                    }
                )
            ]}
        >
            <StorageScreen searchValue={searchValue} />
        </ContentOverlay>
    );
};

export default StorageOverlay;