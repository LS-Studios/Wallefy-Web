import React, {PropsWithChildren} from 'react';
import {DialogProvider} from "./DialogProvider";
import {ContextMenuProvider} from "./ContextMenuProvider";
import {ToastProvider} from "./Toast/ToastProvider";
import {SettingsProvider} from "./SettingsProvider";
import {AccountProvider} from "./AccountProvider";

const Providers = ({
    children
}: PropsWithChildren) => {
    return (
        <ToastProvider>
            <ContextMenuProvider>
                <DialogProvider>
                    {children}
                </DialogProvider>
            </ContextMenuProvider>
        </ToastProvider>
    );
};

export default Providers;