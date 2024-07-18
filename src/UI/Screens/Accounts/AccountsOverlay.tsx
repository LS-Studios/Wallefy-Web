import React, {useState} from 'react';
import {MdAdd, MdOutlineAccountCircle, MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import AccountsScreen from "./AccountsScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import CreateAccountDialog from "../../Dialogs/CreateAccountDialog/CreateAccountDialog";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import FilterTransactionsDialog from "../../Dialogs/FilterTransactionsDialog/FilterTransactionsDialog";
import {FilterModel} from "../../../Data/DataModels/FilterModel";

const AccountsOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog()

    const [filterValue, setFilterValue] = useState<FilterModel>(new FilterModel())

    return (
        <ContentOverlay
            title={translate("accounts")}
            titleIcon={<MdOutlineAccountCircle />}
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
                ),
                new ContentAction(
                    translate("add-account"),
                    () => {
                        dialog.open(
                            new DialogModel(
                                translate("create-account"),
                                <CreateAccountDialog />,
                            )
                        )
                    },
                    false,
                    false,
                    <MdAdd />,
                )
            ]}>
            <AccountsScreen searchValue={filterValue.searchName || ""} />
        </ContentOverlay>
    );
};

export default AccountsOverlay;