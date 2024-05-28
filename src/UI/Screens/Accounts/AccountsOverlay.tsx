import React, {useState} from 'react';
import {MdAdd, MdOutlineAccountCircle, MdOutlineMonetizationOn, MdSort, MdTune} from "react-icons/md";
import {ContentSearchAction} from "../../../Data/ContentAction/ContentSearchAction";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import AccountsScreen from "./AccountsScreen";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/Providers/DialogModel";
import CreateAccountDialog from "../../Dialogs/CreateAccountDialog/CreateAccountDialog";

const AccountsOverlay = () => {
    const dialog = useDialog()

    const [searchValue, setSearchValue] = useState<string>("");

    return (
        <ContentOverlay
            title="Accounts"
            titleIcon={<MdOutlineAccountCircle />}
            actions={[
                new ContentSearchAction(
                    "Search for accounts",
                    (searchText) => {
                        setSearchValue(searchText);
                    }
                ),
                new ContentAction(
                    "Add account",
                    () => {
                        dialog.open(
                            new DialogModel(
                                "Create account",
                                <CreateAccountDialog />,
                            )
                        )
                    },
                    false,
                    <MdAdd />,
                )
            ]}>
            <AccountsScreen searchValue={searchValue} />
        </ContentOverlay>
    );
};

export default AccountsOverlay;