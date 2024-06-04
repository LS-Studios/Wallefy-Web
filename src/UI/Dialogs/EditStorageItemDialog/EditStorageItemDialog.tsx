import React from 'react';
import DialogBase from "../../Provider/DialogBase/DialogBase";
import {StorageItemModel} from "../../../Data/StorageItemModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {deleteDBItem, updateDBItem} from "../../../Helper/AceBaseHelper";
import TextInputComponent from "../../Components/Input/TextInput/TextInputComponent";

const EditStorageItemDialog = ({
    storageItem
}: {
    storageItem: StorageItemModel
}) => {
    const dialog = useDialog();

    const [newName, setNewName] = React.useState<string>(storageItem.item.name);

    return <DialogOverlay
        actions={[
            new ContentAction(
                "Save",
                () => {
                    storageItem.item.name = newName;
                    updateDBItem(storageItem.itemType, storageItem.item).then(() => dialog.closeCurrent());
                },
            ),
            new ContentAction(
                "Delete",
                () => {
                    deleteDBItem(storageItem.itemType, storageItem.item).then(() => dialog.closeCurrent());
                }
            )
        ]}
    >
        <TextInputComponent
            title="Name"
            value={newName}
            onValueChange={(value) => setNewName(value as string)}
        />
    </DialogOverlay>
};

export default EditStorageItemDialog;