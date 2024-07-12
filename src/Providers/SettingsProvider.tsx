import React, {useState, useMemo, PropsWithChildren, useContext, useEffect} from 'react';
import uuid from "react-uuid";
import {DialogModel} from "../Data/DataModels/DialogModel";
import DialogBase from "../UI/Provider/DialogBase/DialogBase";
import {ContextMenuContext, DialogContext, SettingsContext} from "./Contexts";
import {ContextMenuModel} from "../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../UI/Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../Data/ContentAction/ContentAction";
import {SettingsModel} from "../Data/DataModels/SettingsModel";
import {getDBObjectOnChange} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";

export const SettingsProvider = ({ children }: PropsWithChildren) => {
    const [settings, setSettings] = useState<SettingsModel | null>(null);

    useEffect(() => {
        getDBObjectOnChange(DatabaseRoutes.SETTINGS, (settings) => {
            setSettings(settings as SettingsModel)
        })
    }, [])

    const value: SettingsModel | null = useMemo(() => (settings), [settings]);

    return (
        <SettingsContext.Provider value={value}>
            { children }
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsModel | null => useContext(SettingsContext);