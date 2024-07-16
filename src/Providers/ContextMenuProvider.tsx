import React, {useState, useMemo, PropsWithChildren, useContext} from 'react';
import uuid from "react-uuid";
import {DialogModel} from "../Data/DataModels/DialogModel";
import DialogBase from "../UI/Provider/DialogBase/DialogBase";
import {ContextMenuContext, DialogContext} from "./Contexts";
import {ContextMenuModel} from "../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../UI/Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../Data/ContentAction/ContentAction";

export interface ContextMenuProviderProps {
    handleOnContextMenu: (e: React.MouseEvent, options?: ContentAction[], content?: React.ReactNode, canBeHovered?: boolean) => void;
    closeContextMenu: () => void;
}

export const ContextMenuProvider = ({ children }: PropsWithChildren) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuModel | null>(null);

    const handleOnContextMenu = (e: React.MouseEvent, options?: ContentAction[], content?: React.ReactNode, canBeHovered?: boolean) => {
        e.preventDefault();
        setContextMenu(new ContextMenuModel(content, options, e.pageX, e.pageY, canBeHovered));
    }

    const closeContextMenu = () => {
        setContextMenu(null);
    }

    const contextValue: ContextMenuProviderProps =
        useMemo(() => ({
            handleOnContextMenu,
            closeContextMenu
        }), [contextMenu]);

    return (
        <ContextMenuContext.Provider value={contextValue}>
            { children }

            { contextMenu && <ContextMenuBase
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
            /> }

        </ContextMenuContext.Provider>
    );
};

export const useContextMenu = (): ContextMenuProviderProps => useContext(ContextMenuContext);