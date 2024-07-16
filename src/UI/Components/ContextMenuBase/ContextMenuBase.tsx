import React from 'react';
import {ContextMenuModel} from "../../../Data/DataModels/ContextMenuModel";

import './ContextMenuBase.scss';
import {useClickAway} from "@uidotdev/usehooks";
import Spinner from "../Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useToolTip} from "../../../CustomHooks/useToolTip";

const ContextMenuBase = ({
    contextMenu,
    setContextMenu
}: {
    contextMenu: ContextMenuModel,
    setContextMenu: (contextMenu: ContextMenuModel | null) => void
}) => {
    const { isOnRight, isOnBottom} = useToolTip()

    const ref = useClickAway(() => {
        setContextMenu(null)
    }) as React.RefObject<HTMLDivElement>

    return (
        <div
            ref={ref}
            className="context-menu-base"
            style={{
                top: contextMenu.y + (!contextMenu.canBeHovered ? (isOnBottom ? 0 : -60) : 0),
                left: contextMenu.x + (!contextMenu.canBeHovered ? (isOnRight ? 20 : -100) : 0),
            }}
        >
            {contextMenu.content}
            {contextMenu.options?.map((option, i) => (
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