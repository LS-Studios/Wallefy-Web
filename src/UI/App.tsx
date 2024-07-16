import React, {useEffect} from 'react';
import './App.scss';
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
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
import {useCurrentAccount} from "../Providers/AccountProvider";
import {AccountType} from "../Data/EnumTypes/AccountType";
import TransactionsOverlay from "./Screens/Transactions/TransactionsOverlay";
import EvaluationOverlay from "./Screens/Evaluation/EvaluationOverlay";
import {calculateBalances} from "../Helper/CalculationHelper";
import {getDBItemOnChange, getDBObject, getDBObjects, setDBObject} from "../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useDatabaseRoute} from "../CustomHooks/useDatabaseRoute";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {useTransactions} from "../CustomHooks/useTransactions";
import {executePastTransactions} from "../Helper/TransactionHelper";

function App() {
    const settings = useSettings()
    const systemTheme = useThemeDetector()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const getAccountDatabaseRoute = useDatabaseRoute(false)
    const getDatabaseRoute = useDatabaseRoute()

    const transactions = useTransactions()

    const [initialPastTransactionsCheck, setInitialPastTransactionsCheck] = React.useState(false)

    useEffect(() => {
        if (initialPastTransactionsCheck || !currentAccount || !getDatabaseRoute || !transactions) return

        setInitialPastTransactionsCheck(true)

        executePastTransactions(transactions, currentAccount, updateAccountBalance, getDatabaseRoute)
    }, [currentAccount]);

    useEffect(() => {
        if (!settings || !getDatabaseRoute || !getAccountDatabaseRoute) return

        getDBItemOnChange(getAccountDatabaseRoute(DatabaseRoutes.ACCOUNTS), settings.currentAccountUid, (account) => {
            if (!account || (account as AccountModel).type === AccountType.DEFAULT) return

            getDBObjects(
                getDatabaseRoute(DatabaseRoutes.DEBTS)
            ).then((debts) => {
                getDBObjects(
                    getDatabaseRoute(DatabaseRoutes.PAYED_DEBTS)
                ).then((payedDebts) => {
                    const balances = calculateBalances(debts, payedDebts, (account as AccountModel).currencyCode)

                    setDBObject(
                        getAccountDatabaseRoute(DatabaseRoutes.ACCOUNTS) + "/" + account.uid + "/balance",
                        balances.reduce((acc, balance) => balance.balance < 0 ? acc + balance.balance : acc, 0)
                    )
                })
            })
        })
    }, [settings, getDatabaseRoute, getAccountDatabaseRoute])

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

    if (!settings) return null

    return <div className={"app " + getTheme()}>
        <Providers>
            <Routes>
                <Route path={RoutePath.AUTHENTICATION} element={
                    <Redirect redirectIf={isLoggedIn} redirectTo={RoutePath.HOME}>
                        <AuthenticationScreen />
                    </Redirect>
                } />
                <Route path={RoutePath.HOME} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        <HomeOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.CREATE_TRANSACTION} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        <CreateTransactionOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.TRANSACTION_OVERVIEW} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        <Redirect redirectIf={currentAccount?.type === AccountType.DEBTS} redirectTo={RoutePath.EVALUATION}>
                            <TransactionOverviewOverlay />
                        </Redirect>
                    </Redirect>
                } />
                <Route path={RoutePath.EVALUATION} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        <Redirect redirectIf={currentAccount?.type === AccountType.DEFAULT} redirectTo={RoutePath.TRANSACTION_OVERVIEW}>
                            <EvaluationOverlay />
                        </Redirect>
                    </Redirect>
                } />
                <Route path={RoutePath.TRANSACTIONS} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        { currentAccount?.type === AccountType.DEFAULT ? <TransactionsOverlay /> : <DebtOverlay /> }
                    </Redirect>
                } />
                <Route path={RoutePath.STORAGE} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                        <StorageOverlay />
                    </Redirect>
                } />
                <Route path={RoutePath.ACCOUNTS} element={
                    <Redirect redirectIf={!isLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
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
