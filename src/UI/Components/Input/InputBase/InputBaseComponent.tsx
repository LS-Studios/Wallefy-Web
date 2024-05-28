import React, {CSSProperties, PropsWithChildren, useEffect, useState} from 'react';
import './InputBaseComponent.scss';
import {MdCheckBox, MdCheckBoxOutlineBlank, MdOutlineCheckBox} from "react-icons/md";

const InputBaseComponent = ({
    title,
    style,
    labelClassName,
    onClick,
    enabled,
    setEnabled,
    children
 }: PropsWithChildren<{
    title: string,
    style?: CSSProperties,
    labelClassName?: string,
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void,
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
    >
        <div className="input-base-component-header">
            <label className={labelClassName}>{title}</label>
            { enabled === undefined ? null : (!enabled ? <MdCheckBoxOutlineBlank id="input-base-component-header-icon" /> : <MdOutlineCheckBox id="input-base-component-header-icon" />) }
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