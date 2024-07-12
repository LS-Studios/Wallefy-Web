import {ReactElement} from "react";

export class DialogModel {

    public id: string;
    public title: string;
    public dialog: ReactElement;

    constructor(title: string, dialog: ReactElement, id?: string) {
        this.title = title
        this.dialog = dialog;
        this.id = id ?? "";
    }

}