import {DialogProviderProps} from "./DialogProvider";
import {createContext} from "react";
import {ContextMenuProviderProps} from "./ContextMenuProvider";
import {ToastProviderProps} from "./Toast/ToastProvider";

export const DialogContext = createContext({} as DialogProviderProps)
export const ContextMenuContext = createContext({} as ContextMenuProviderProps)
export const ToastContext = createContext({} as ToastProviderProps)