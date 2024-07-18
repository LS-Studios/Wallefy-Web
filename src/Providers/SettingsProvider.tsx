import React, {PropsWithChildren, useContext, useEffect, useMemo, useState} from 'react';
import {SettingsContext} from "./Contexts";
import {SettingsModel} from "../Data/DataModels/SettingsModel";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {getActiveDatabaseHelper} from "../Helper/Database/ActiveDBHelper";

export const SettingsProvider = ({ children }: PropsWithChildren) => {
    const [settings, setSettings] = useState<SettingsModel | null>(null);

    useEffect(() => {
        getActiveDatabaseHelper().getDBObjectOnChange(DatabaseRoutes.SETTINGS, (settings: SettingsModel) => {
            if (!settings) {
                getActiveDatabaseHelper().setDBObject(
                    DatabaseRoutes.SETTINGS,
                    new SettingsModel()
                ).then((newSettings: SettingsModel) => {
                    setSettings(newSettings)
                })
            } else {
                setSettings(settings as SettingsModel)
            }
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