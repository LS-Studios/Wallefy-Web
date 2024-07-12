import React from 'react';
import './StorageItem.scss';
import {useDialog} from "../../../../Providers/DialogProvider";
import {StorageItemModel} from "../../../../Data/DatabaseModels/StorageItemModel";
import EditStorageItemDialog from "../../../Dialogs/EditStorageItemDialog/EditStorageItemDialog";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";

const StorageItem = ({
    storageItem,
    translate
 }: {
    storageItem: StorageItemModel,
    translate: (string: string) => string
}) => {
    const dialog = useDialog();

    const getTitle = () => {
        switch (storageItem.itemType) {
            case DatabaseRoutes.TRANSACTION_PARTNERS:
                return translate("edit-transaction-partner")
            case DatabaseRoutes.CATEGORIES:
                return translate("edit-category")
            case DatabaseRoutes.LABELS:
                return translate("edit-label")
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