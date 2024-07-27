import React from 'react';
import {StorageItemModel} from "../../../Data/DatabaseModels/StorageItemModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";

const EditStorageItemDialog = ({
    storageItem,
    isTempItem = false,
    onEdit,
    onDelete
}: {
    storageItem: StorageItemModel,
    isTempItem?: boolean,
    onEdit?: (newStorageItem: StorageItemModel) => void,
    onDelete?: () => void
}) => {
    const getDatabaseRoute = useAccountRoute()
    const translate = useTranslation()
    const dialog = useDialog();

    const [newName, setNewName] = React.useState<string>(storageItem.item.name || "");

    return <DialogOverlay
        actions={[
            new ContentAction(
                translate("save"),
                () => {
                    storageItem.item.name = newName;
                    if (isTempItem) {
                        onEdit && onEdit(storageItem);
                        dialog.closeCurrent()
                    } else {
                        getActiveDatabaseHelper().updateDBItem(getDatabaseRoute!(storageItem.itemType), storageItem.item).then(() => dialog.closeCurrent());
                    }
                },
                false,
                getDatabaseRoute === null
            ),
            new ContentAction(
                translate("delete"),
                () => {
                    if (isTempItem) {
                        onDelete && onDelete();
                        dialog.closeCurrent()
                    } else {
                        getActiveDatabaseHelper().deleteDBItem(getDatabaseRoute!(storageItem.itemType), storageItem.item).then(() => dialog.closeCurrent());
                    }
                },
                false,
                getDatabaseRoute === null
            )
        ]}
    >
        <TextInputComponent
            title={translate("name")}
            value={newName}
            onValueChange={(value) => setNewName(value as string)}
        />
    </DialogOverlay>
};

export default EditStorageItemDialog;