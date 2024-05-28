import React, {useState} from 'react';
import {MdAdd, MdAddCircleOutline, MdContentPaste, MdTune} from "react-icons/md";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import CreateTrabsactionScreen from "./CreateTransactionScreen";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/Providers/DialogModel";
import CreateTransactionDialog from "../../Dialogs/CreateTransactionDialog/CreateTransactionDialog";
import {useToast} from "../../../Providers/Toast/ToastProvider";

const CreateTransactionOverlay = () => {
    const dialog = useDialog();
    const toast = useToast()

    return (
        <ContentOverlay
            title="Create transaction"
            titleIcon={<MdAddCircleOutline />}
            actions={[
                new ContentAction(
                    "New custom transaction",
                    () => {
                        dialog.open(
                            new DialogModel(
                                "Create transaction",
                                <CreateTransactionDialog />
                            )
                        );
                    },
                    false,
                    <MdAdd />,
                ),
                new ContentAction(
                    "New preset",
                    () => {
                        dialog.open(
                            new DialogModel(
                                "Create transaction preset",
                                <CreateTransactionDialog
                                    isPreset={true}
                                />
                            )
                        );
                    },
                    false,
                    <MdTune />,
                ),
                new ContentAction(
                    "Paste from clipboard",
                    () => {
                        navigator.clipboard.readText()
                            .then((text) => {
                                try {
                                    const transaction = JSON.parse(text);
                                    transaction.uid = "";

                                    dialog.open(
                                        new DialogModel(
                                            "Create transaction",
                                            <CreateTransactionDialog
                                                transaction={transaction}
                                            />
                                        )
                                    );
                                } catch (e) {
                                    console.error(e);
                                    toast.open("Invalid transaction data in clipboard");
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            })
                    },
                    false,
                    <MdContentPaste />,
                ),
            ]}>
            <CreateTrabsactionScreen />
        </ContentOverlay>
    );
};

export default CreateTransactionOverlay;