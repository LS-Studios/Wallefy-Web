import React from "react";

export class ToastModel {

    public id: string;
    public message: string | React.ReactNode;

    constructor(id: string, message: string | React.ReactNode) {
        this.id = id;
        this.message = message;
    }

}