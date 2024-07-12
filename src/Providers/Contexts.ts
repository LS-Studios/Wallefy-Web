import {DialogProviderProps} from "./DialogProvider";
import {createContext} from "react";
import {ContextMenuProviderProps} from "./ContextMenuProvider";
import {ToastProviderProps} from "./Toast/ToastProvider";
import {SettingsModel} from "../Data/DataModels/SettingsModel";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";

export const DialogContext = createContext({} as DialogProviderProps)
export const ContextMenuContext = createContext({} as ContextMenuProviderProps)
export const ToastContext = createContext({} as ToastProviderProps)
export const SettingsContext = createContext({} as SettingsModel | null)
export const AccountContext = createContext({} as AccountModel | null)