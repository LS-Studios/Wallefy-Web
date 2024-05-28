import {ContentAction} from "../ContentAction/ContentAction";

export class ContextMenuModel {
    options: ContentAction[] = [];
    x: number = 0;
    y: number = 0;

    constructor(options?: ContentAction[], x?: number, y?: number) {
        this.options = options || [];
        this.x = x || 0;
        this.y = y || 0;
    }
}