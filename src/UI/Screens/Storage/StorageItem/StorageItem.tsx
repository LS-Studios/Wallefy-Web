import React from 'react';
import './StorageItem.scss';
import {useDialog} from "../../../../Providers/DialogProvider";
import {StorageItemModel} from "../../../../Data/StorageItemModel";
import EditStorageItemDialog from "../../../Dialogs/EditStorageItemDialog/EditStorageItemDialog";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";

const StorageItem = ({
    storageItem,
 }: {
    storageItem: StorageItemModel,
}) => {
    const dialog = useDialog();

    const getTitle = () => {
        switch (storageItem.itemType) {
            case DatabaseRoutes.TRANSACTION_PARTNERS:
                return "Edit Transaction Partner";
            case DatabaseRoutes.CATEGORIES:
                return "Edit Category";
            case DatabaseRoutes.LABELS:
                return "Edit Label";
            default:
                return "";

        }
    }

    const openEditStorageItem = () => {
        dialog.open(
            new DialogModel(
                getTitle(),
                <EditStorageItemDialog
                    storageItem={storageItem}
                />
            )
        );
    }

    return (
        <div
            className="storage-item"
            onClick={openEditStorageItem}
        >
            <span id="storage-item-name">{storageItem.item.name}</span>
        </div>
    );
};

export default StorageItem;