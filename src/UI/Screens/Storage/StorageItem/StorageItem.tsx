import React from 'react';
import './StorageItem.scss';
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import {useDialog} from "../../../../Providers/DialogProvider";
import TransactionDetailDialog from "../../../Dialogs/TransactionDetailDialog/TransactionDetailDialog";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import {TransactionPartnerModel} from "../../../../Data/TransactionPartnerModel";
import {StorageItemModel} from "../../../../Data/StorageItemModel";

const StorageItem = ({
    storageItem,
 }: {
    storageItem: StorageItemModel<any>,
}) => {
    const dialog = useDialog();

    const openEditStorageItem = () => {
        // dialog.open(
        //     new DialogModel(
        //         "S detail",
        //         <TransactionDetailDialog
        //             transaction={transaction}
        //             preFetchedTransactionPartners={transactionPartners}
        //         />
        //     )
        // );
    }

    return (
        <div
            className="storage-item"
            onClick={openEditStorageItem}
        >
            {storageItem.name}
        </div>
    );
};

export default StorageItem;