import React from "react";
import {ContentActionType} from "../EnumTypes/ContentActionType";

export interface ContentActionInterface {
    name: string;
    type: ContentActionType;
}