import React, {CSSProperties, PropsWithChildren, useEffect, useState} from 'react';
import './InputBaseComponent.scss';
import {MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineCheckBox} from "react-icons/md";
import Divider from "../../Divider/Divider";
import {IconType} from "react-icons";

const InputBaseComponent = ({
    title,
    style,
    labelClassName,
    onClick,
    onDrop,
    onDrag,
    Icon,
    onIconClick,
    enabled,
    setEnabled,
    children
 }: PropsWithChildren<{
    title: string,
    style?: CSSProperties,
    labelClassName?: string,
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void,
    onDrag?: (e: React.DragEvent<HTMLDivElement>) => void,
    Icon?: IconType,
    onIconClick?: (e: React.MouseEvent<SVGElement>) => void,
    enabled?: boolean,
    setEnabled?: (enabled: boolean) => void
}>) => {
    return <div
        style={style}
        className={"input-base-component " + (enabled === undefined ? "" : (enabled ? "enabled" : "disabled"))}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            if (onClick) {
                onClick(e);
            }
            if (setEnabled) {
                setEnabled(!enabled);
            }
        }}
        onDrop={onDrop}
        onDrag={onDrag}
    >
        <div className="input-base-component-header">
            <label className={labelClassName}>{title}</label>
            { enabled === undefined ? null : (!enabled ? <MdCheckBoxOutlineBlank id="input-base-component-header-icon" /> : <MdOutlineCheckBox id="input-base-component-header-icon" />) }
            { Icon && <Icon id="input-base-component-header-icon" onClick={onIconClick} />}
        </div>
        { enabled === undefined ? children : enabled && <div
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            { children }
        </div> }
    </div>
};

export default InputBaseComponent;