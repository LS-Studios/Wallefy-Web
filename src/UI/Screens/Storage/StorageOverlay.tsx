import React, {useState} from 'react';
import {MdInventory, MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import StorageScreen from "./StorageScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import FilterTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/FilterTransactionsDialog";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import OptionDialog from "../../Dialogs/OptionDialog/OptionDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";

const StorageOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog()

    const [filterValue, setFilterValue] = useState<FilterModel>(new FilterModel())

    return (
        <ContentOverlay
            title={translate("storage")}
            titleIcon={<MdInventory />}
            actions={[
                new ContentAction(
                    translate("filter"),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("filter-transactions"),
                                <FilterTransactionsDialog
                                    currentFilter={filterValue}
                                    onFilterChange={setFilterValue}
                                    onlyName={true}
                                />
                            )
                        )
                    },
                    false,
                    false,
                    <MdTune />,
                )
            ]}
        >
            <StorageScreen searchValue={filterValue.searchName || ""} />
        </ContentOverlay>
    );
};

export default StorageOverlay;