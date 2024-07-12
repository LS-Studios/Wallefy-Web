import React, {useEffect, useMemo, useState} from 'react';
import './App.scss';
import Menu from "./Menu/Menu";
import {Navigate, Route, Routes} from "react-router-dom";
import DebtOverlay from "./Screens/Debts/DebtOverlay";
import CreateTransactionOverlay from "./Screens/CreateTransaction/CreateTransactionOverlay";
import Providers from "../Providers/Providers";
import AccountsOverlay from "./Screens/Accounts/AccountsOverlay"
import StorageOverlay from "./Screens/Storage/StorageOverlay";
import {RoutePath} from "../Data/EnumTypes/RoutePath";
import TransactionOverviewOverlay from "./Screens/TransactionOverview/TransactionOverviewOverlay";
import HomeOverlay from "./Screens/Home/HomeOverlay";
import {ThemeType} from "../Data/EnumTypes/ThemeType";
// @ts-ignore
import variables from "../Data/Variables.scss";
import {useSettings} from "../Providers/SettingsProvider";
import {useThemeDetector} from "../CustomHooks/useThemeDetector";
import AuthenticationScreen from "./Screens/Authentication/AuthenticationScreen";
import Redirect from "./Components/CheckAuth/Redirect";
import {getDBObject} from "../Helper/AceBaseHelper";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {AccountType} from "../Data/EnumTypes/AccountType";
import TransactionsOverlay from "./Screens/Transactions/TransactionsOverlay";
import EvaluationOverlay from "./Screens/Evaluation/EvaluationOverlay";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";

function App() {
    const settings = useSettings()
    const systemTheme = useThemeDetector()
    const currentAccount = useCurrentAccount()

    useEffect(() => {
        if (!settings) return

        const css = getComputedStyle(document.documentElement)

        const switchLightOrDarkTheme = (theme: ThemeType) => {
            switch (theme) {
                case ThemeType.DARK:
                    document.body.style.backgroundColor = css.getPropertyValue('--background-dark')
                    break;
                case ThemeType.LIGHT:
                    document.body.style.backgroundColor = css.getPropertyValue('--background-light')
                    break;
            }
        }

        switch (settings.theme) {
            case ThemeType.SYSTEM:
                switchLightOrDarkTheme(systemTheme)
                break;
            default:
                switchLightOrDarkTheme(settings.theme)
                break
        }
    }, [settings, systemTheme]);

    const getTheme = () => {
        switch (settings?.theme) {
            case ThemeType.SYSTEM:
                return systemTheme
            default:
                return settings?.theme
        }
    }

    const isLoggedIn = settings?.currentUserUid !== null && settings?.currentUserUid !== undefined && settings?.currentUserUid !== ""

    return <div className={"app " + getTheme()}>
        <Providers>
            <Routes>
                <Route path={RoutePath.AUTHENTICATION} element={
                    <Redirect redirectIf={isLoggedIn} redirectTo="/home">
                        <AuthenticationScreen />
                    </Redirect>
                } />
                <Route path={RoutePath.HOME} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <HomeOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.CREATE_TRANSACTION} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <CreateTransactionOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.TRANSACTION_OVERVIEW} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <TransactionOverviewOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.EVALUATION} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <EvaluationOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.TRANSACTIONS} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        { currentAccount?.type === AccountType.DEFAULT ? <TransactionsOverlay /> : <DebtOverlay /> }
                    </Redirect>
                } />
                <Route path={RoutePath.STORAGE} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <StorageOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.ACCOUNTS} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo="/authentication">
                        <AccountsOverlay />
                    </Redirect>
                } />
                <Route path={"*"} element={
                    <Navigate to="/home" />
                } />
            </Routes>
        </Providers>
    </div>
}

export default App;
