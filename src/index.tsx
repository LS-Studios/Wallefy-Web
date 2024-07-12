import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './UI/App';
import {BrowserRouter} from "react-router-dom";
import {SettingsProvider} from "./Providers/SettingsProvider";
import {AccountProvider} from "./Providers/AccountProvider";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <SettingsProvider>
        <AccountProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AccountProvider>
    </SettingsProvider>
);
