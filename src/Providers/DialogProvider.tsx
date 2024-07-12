import React, {useState, useMemo, PropsWithChildren, useContext} from 'react';
import uuid from "react-uuid";
import {DialogModel} from "../Data/DataModels/DialogModel";
import DialogBase from "../UI/Provider/DialogBase/DialogBase";
import {DialogContext} from "./Contexts";

export interface DialogProviderProps {
    open: (dialog: DialogModel, id?: string) => void,
    close: (id: string) => void,
    closeCurrent: () => void
}

export const DialogProvider = ({ children }: PropsWithChildren) => {
    const [dialogs, setDialogs] = useState<DialogModel[]>([]);
    const open = (dialog: DialogModel, id?: string) => {
        setDialogs(currentDialogs => {
            dialog.id = id ?? uuid()
            return [
                ...currentDialogs,
                dialog
            ];
        });

        document.body.style.overflow = "hidden"
    }

    const close = (id: string) => {
        setDialogs((currentDialogs) => {
            const newDialogs = currentDialogs.filter((dialog) => dialog.id !== id)

            if (newDialogs.length == 0) {
                document.body.style.overflow = "visible"
            }

            return newDialogs
        })
    }

    const closeCurrent = () => {
        const currentDialog = dialogs.pop()

        if (currentDialog)
            close(currentDialog.id)
    }

    const contextValue: DialogProviderProps =
        useMemo(() => ({
            open,
            close,
            closeCurrent
        }), [dialogs]);

    return (
        <DialogContext.Provider value={contextValue}>
            { children }

            {dialogs.map((dialog) => (
                <DialogBase title={dialog.title} onClose={() => close(dialog.id)}>
                    { dialog.dialog }
                </DialogBase>
            ))}
        </DialogContext.Provider>
    );
};

export const useDialog = (): DialogProviderProps => useContext(DialogContext);