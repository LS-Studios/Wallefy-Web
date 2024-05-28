import React from "react";
import {ContentAction} from "./ContentAction";
import {ContentActionInterface} from "./ContentActionInterface";
import {ContentActionType} from "./ContentActionType";

export class ContentSearchAction implements ContentActionInterface {
    name: string;
    type: ContentActionType = ContentActionType.SEARCH;

    placeholder: string = "Search for transactions";
    onSearchTextChanged: (searchText: string) => void;

    constructor(placeholder: string, onSearchTextChanged: (searchText: string) => void) {
        this.name = "Search";
        this.placeholder = placeholder;
        this.onSearchTextChanged = onSearchTextChanged;
    }
}