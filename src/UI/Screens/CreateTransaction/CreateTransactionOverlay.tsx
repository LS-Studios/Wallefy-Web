import React from 'react';
import {MdAdd, MdAddCircleOutline, MdContentPaste, MdTune} from "react-icons/md";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import ContentOverlay from "../../ContentOverlay/ContentOverlay";
import CreateTransactionScreen from "./CreateTransactionScreen";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import CreateTransactionDialog from "../../Dialogs/CreateTransactionDialog/CreateTransactionDialog";
import {useToast} from "../../../Providers/Toast/ToastProvider";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import CreateDebtDialog from "../../Dialogs/CreateDebtDialog/CreateDebtDialog";

const CreateTransactionOverlay = () => {
    const translate = useTranslation()
    const dialog = useDialog();
    const toast = useToast()

    const currentAccount = useCurrentAccount();

    return (
        <ContentOverlay
            title={translate("create-transaction")}
            titleIcon={<MdAddCircleOutline />}
            actions={[
                new ContentAction(
                    translate("new-transaction"),
                    () => {
                        if (currentAccount?.type === AccountType.DEFAULT) {
                            dialog.open(
                                new DialogModel(
                                    translate("create-transaction"),
                                    <CreateTransactionDialog/>
                                )
                            );
                        } else {
                            dialog.open(
                                new DialogModel(
                                    translate("create-transaction"),
                                    <CreateDebtDialog/>
                                )
                            );
                        }
                    },
                    false,
                    false,
                    <MdAdd />,
                ),
                new ContentAction(
                    translate("new-preset"),
                    () => {
                        if (currentAccount?.type === AccountType.DEFAULT) {
                            dialog.open(
                                new DialogModel(
                                    translate("create-transaction-preset"),
                                    <CreateTransactionDialog
                                        isPreset={true}
                                    />
                                )
                            );
                        } else {
                            dialog.open(
                                new DialogModel(
                                    translate("create-transaction-preset"),
                                    <CreateDebtDialog
                                        isPreset={true}
                                    />
                                )
                            );
                        }
                    },
                    false,
                    false,
                    <MdTune />,
                ),
                new ContentAction(
                    translate("paste-from-clipboard"),
                    () => {
                        navigator.clipboard.readText()
                            .then((text) => {
                                try {
                                    const transaction = JSON.parse(text);
                                    transaction.uid = "";

                                    if (currentAccount?.type === AccountType.DEFAULT) {
                                        dialog.open(
                                            new DialogModel(
                                                translate("create-transaction"),
                                                <CreateTransactionDialog
                                                    transaction={transaction}
                                                />
                                            )
                                        );
                                    } else {
                                        dialog.open(
                                            new DialogModel(
                                                translate("create-transaction"),
                                                <CreateDebtDialog
                                                    debt={transaction}
                                                />
                                            )
                                        );
                                    }
                                } catch (e) {
                                    console.error(e);
                                    toast.open(translate("invalid-transaction-data-in-clipboard"));
                                }
                            })
                            .catch((err) => {
                                console.error(err);
                            })
                    },
                    false,
                    false,
                    <MdContentPaste />,
                ),
            ]}>
            <CreateTransactionScreen />
        </ContentOverlay>
    );
};

export default CreateTransactionOverlay;