import React from 'react';
import {ContextMenuModel} from "../../../Data/DataModels/ContextMenuModel";

import './ContextMenuBase.scss';
import {useClickAway} from "@uidotdev/usehooks";
import Spinner from "../Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

const ContextMenuBase = ({
    contextMenu,
    setContextMenu
}: {
    contextMenu: ContextMenuModel,
    setContextMenu: (contextMenu: ContextMenuModel | null) => void
}) => {
    const ref = useClickAway(() => {
        setContextMenu(null)
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
                        setContextMenu(null)
                        option.action()
                    }}
                >
                    { option.loading ? <Spinner type={SpinnerType.CYCLE} /> : <>
                        {option.icon}
                        <span>{option.name}</span>
                    </> }
                </div>
            ))}
        </div>
    );
};

export default ContextMenuBase;