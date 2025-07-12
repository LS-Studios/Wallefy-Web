import {ReactElement} from "react";

export class DialogModel {

    public id: string;
    public title: string | null;
    public dialog: ReactElement;
    public width: number = 400

    constructor(title: string | null, dialog: ReactElement, width: number = 400, showHeader?: boolean, id?: string) {
        this.title = title
        this.dialog = dialog;
        this.width = width;
        this.id = id ?? "";
    }

}