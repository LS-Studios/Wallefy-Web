import React from 'react';
import {ContextMenuModel} from "../../../Data/Providers/ContextMenuModel";

import './ContextMenuBase.scss';
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import { useClickAway } from "@uidotdev/usehooks";

const ContextMenuBase = ({
    contextMenu,
    setContextMenu
}: {
    contextMenu: ContextMenuModel,
    setContextMenu: (contextMenu: ContextMenuModel) => void
}) => {
    const ref = useClickAway(() => {
        setContextMenu(new ContextMenuModel())
    }) as React.RefObject<HTMLDivElement>

    return (
        <div
            ref={ref}
            className="context-menu-base"
            style={{
                top: contextMenu.y,
                left: contextMenu.x,
            }}
        >
            {contextMenu.options.map((option, i) => (
                <div
                    key={i}
                    className={"context-menu-base-option " + (option.disabled ? "disabled" : "")}
                    onClick={() => {
                        setContextMenu(new ContextMenuModel())
                        option.action()
                    }}
                >
                    {option.icon}
                    <span>{option.name}</span>
                </div>
            ))}
        </div>
    );
};

export default ContextMenuBase;