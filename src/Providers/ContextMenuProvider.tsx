import React, {useState, useMemo, PropsWithChildren, useContext} from 'react';
import uuid from "react-uuid";
import {DialogModel} from "../Data/DataModels/DialogModel";
import DialogBase from "../UI/Provider/DialogBase/DialogBase";
import {ContextMenuContext, DialogContext} from "./Contexts";
import {ContextMenuModel} from "../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../UI/Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../Data/ContentAction/ContentAction";

export interface ContextMenuProviderProps {
    handleOnContextMenu: (e: React.MouseEvent, options: ContentAction[]) => void;
}

export const ContextMenuProvider = ({ children }: PropsWithChildren) => {
    const [contextMenu, setContextMenu] = useState<ContextMenuModel | null>(null);

    const handleOnContextMenu = (e: React.MouseEvent, options: ContentAction[]) => {
        e.preventDefault();
        setContextMenu(new ContextMenuModel(options, e.pageX, e.pageY));
    }

    const contextValue: ContextMenuProviderProps =
        useMemo(() => ({
            handleOnContextMenu
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