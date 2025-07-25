import React, {useState, useMemo, PropsWithChildren, useContext} from 'react';
import "./ToastProvider.scss";
import {ToastModel} from "../../Data/DataModels/ToastModel";
import uuid from "react-uuid";
import {ToastContext} from "../Contexts";
import Toast from "../../UI/Provider/Toast/Toast";

export interface ToastProviderProps {
    open: (message: string | React.ReactNode) => void;
}

export const ToastProvider = ({ children }: PropsWithChildren) => {
    const [toasts, setToasts] = useState<ToastModel[]>([]);
    const open = (message: string | React.ReactNode) => {
        setToasts(currentToasts => {
            return [
                ...currentToasts,
                new ToastModel(uuid(), message)
            ];
        });
    }
    const close = (id: string) =>
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
        );

    const contextValue: ToastProviderProps =
        useMemo(() => ({
            open
        }), []);

    return (
        <ToastContext.Provider value={contextValue}>
            { children }

            <div className="toast-overlay">
                <div className="toast-wrapper">
                    {toasts.map((toast) => (
                        <Toast key={toast.id} message={toast.message} close={() => close(toast.id)} />
                    ))}
                </div>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);