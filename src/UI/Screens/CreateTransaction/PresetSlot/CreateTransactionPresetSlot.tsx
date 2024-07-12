import React, {useEffect} from 'react';

import './CreateTransactionPresetSlot.scss';
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import CreateTransactionDialog from "../../../Dialogs/CreateTransactionDialog/CreateTransactionDialog";
import {TransactionPresetModel} from "../../../../Data/DatabaseModels/TransactionPresetModel";
import * as MDIcons from "react-icons/md";
import {ContextMenuModel} from "../../../../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../../../Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {deleteDBItem} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {DebtPresetModel} from "../../../../Data/DatabaseModels/DebtPresetModel";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {AccountType} from "../../../../Data/EnumTypes/AccountType";
import CreateDebtDialog from "../../../Dialogs/CreateDebtDialog/CreateDebtDialog";

const CreateTransactionPresetSlot = ({
    preset,
    isBasic,
}: {
    preset: TransactionPresetModel | DebtPresetModel,
    isBasic: boolean,
}) => {
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()
    const dialog = useDialog()
    const contextMenu = useContextMenu()

    const openCreateTransactionDialog = () => {
        if (currentAccount?.type === AccountType.DEFAULT) {
            dialog.open(
                new DialogModel(
                    translate("create-transaction"),
                    <CreateTransactionDialog
                        transaction={(preset as TransactionPresetModel).presetTransaction}
                        preset={preset as TransactionPresetModel}
                    />,
                )
            )
        } else {
            dialog.open(
                new DialogModel(
                    translate("create-debt"),
                    <CreateDebtDialog
                        debt={(preset as DebtPresetModel).presetDebt}
                        preset={preset as DebtPresetModel}
                    />,
                )
            )
        }
    }

    const Icon = (MDIcons as any)[preset.icon || "MdClose"]

    return <>
        <div
            className="create-transaction-preset-slot" onClick={openCreateTransactionDialog}
            onContextMenu={(e) => contextMenu.handleOnContextMenu(e, [
                new ContentAction("Edit", () => {

                }, isBasic),
                new ContentAction("Delete", () => {
                    deleteDBItem(DatabaseRoutes.PRESETS, preset)
                })
            ])}
        >
            <Icon className="create-transaction-preset-slot-icon" />
            <span className="create-transaction-preset-slot-title">{preset.name}</span>
        </div>
    </>
};

export default CreateTransactionPresetSlot;