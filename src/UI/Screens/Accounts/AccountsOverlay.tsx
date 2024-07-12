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

const AccountsOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog()

    const [searchValue, setSearchValue] = useState<string>("");

    return (
        <ContentOverlay
            title={translate("accounts")}
            titleIcon={<MdOutlineAccountCircle />}
            actions={[
                new ContentSearchAction(
                    translate("search-for-accounts"),
                    (searchText) => {
                        setSearchValue(searchText);
                    }
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
            <AccountsScreen searchValue={searchValue} />
        </ContentOverlay>
    );
};

export default AccountsOverlay;