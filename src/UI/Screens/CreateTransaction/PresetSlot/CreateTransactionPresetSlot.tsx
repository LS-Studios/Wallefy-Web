import React, {useEffect} from 'react';

import './CreateTransactionPresetSlot.scss';
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import CreateTransactionDialog from "../../../Dialogs/CreateTransactionDialog/CreateTransactionDialog";
import {TransactionPresetModel} from "../../../../Data/CreateScreen/TransactionPresetModel";
import * as MDIcons from "react-icons/md";
import {ContextMenuModel} from "../../../../Data/Providers/ContextMenuModel";
import ContextMenuBase from "../../../Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {deleteDBItem} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";

const CreateTransactionPresetSlot = ({
    preset,
    isBasic,
}: {
    preset: TransactionPresetModel,
    isBasic: boolean,
}) => {
    const dialog = useDialog()
    const contextMenu = useContextMenu()

    const openCreateTransactionDialog = () => {
        dialog.open(
            new DialogModel(
                "Create transaction",
                <CreateTransactionDialog
                    transaction={preset.presetTransaction}
                />,
            )
        )
    }

    const Icon = (MDIcons as any)[preset.icon || "MdClose"]

    return <>
        <div
            className="create-transaction-preset-slot" onClick={openCreateTransactionDialog}
            onContextMenu={(e) => contextMenu.handleOnContextMenu(e, [
                new ContentAction("Edit", () => {

                }, isBasic),
                new ContentAction("Delete", () => {
                    deleteDBItem(DatabaseRoutes.CUSTOM_PRESETS, preset)
                    deleteDBItem(DatabaseRoutes.STANDARD_PRESETS, preset)
                })
            ])}
        >
            <Icon className="create-transaction-preset-slot-icon" />
            <span className="create-transaction-preset-slot-title">{preset.presetTransaction.name}</span>
        </div>
    </>
};

export default CreateTransactionPresetSlot;