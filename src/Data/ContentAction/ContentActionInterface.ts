import React from "react";
import {ContentActionType} from "./ContentActionType";

export interface ContentActionInterface {
    name: string;
    type: ContentActionType;
}