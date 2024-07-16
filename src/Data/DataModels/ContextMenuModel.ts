import {ContentAction} from "../ContentAction/ContentAction";
import React from "react";

export class ContextMenuModel {
    options: ContentAction[] = [];
    content: React.ReactNode;
    canBeHovered: boolean = true;
    x: number = 0;
    y: number = 0;

    constructor(content?: React.ReactNode, options?: ContentAction[], x?: number, y?: number, canBeHovered: boolean = true) {
        this.content = content || null
        this.options = options || [];
        this.x = x || 0;
        this.y = y || 0;
        this.canBeHovered = canBeHovered;
    }
}