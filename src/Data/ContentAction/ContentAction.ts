import React from "react";
import {ContentActionType} from "../EnumTypes/ContentActionType";
import {ContentActionInterface} from "./ContentActionInterface";

export class ContentAction implements ContentActionInterface {
    name: string;
    action: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;

    type: ContentActionType = ContentActionType.BUTTON;

    constructor(name: string, action: () => void, disabled?: boolean, loading?: boolean, icon?: React.ReactNode) {
        this.name = name;
        this.action = action;
        this.disabled = disabled;
        this.loading = loading;
        this.icon = icon;
    }
}