import React, {useEffect, useMemo} from 'react';
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
import {useSettings} from "../Providers/SettingsProvider";
import {useThemeDetector} from "../CustomHooks/useThemeDetector";
import AuthenticationScreen from "./Screens/Authentication/AuthenticationScreen";
import Redirect from "./Components/CheckAuth/Redirect";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {AccountType} from "../Data/EnumTypes/AccountType";
import TransactionsOverlay from "./Screens/Transactions/TransactionsOverlay";
import EvaluationOverlay from "./Screens/Evaluation/EvaluationOverlay";
import {calculateBalances} from "../Helper/CalculationHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {useAccountRoute} from "../CustomHooks/Database/useAccountRoute";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {useTransactions} from "../CustomHooks/Database/useTransactions";
import {executePastTransactions} from "../Helper/TransactionHelper";
import {getActiveDatabaseHelper} from "../Helper/Database/ActiveDBHelper";
import Spinner from "./Components/Spinner/Spinner";
import {SpinnerType} from "../Data/EnumTypes/SpinnerType";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import InvitationsScreen from "./Screens/Invitations/InvitationsScreen";
import Joyride, {CallBackProps, STATUS, EVENTS, ACTIONS} from "react-joyride";
import './App.scss';
import {getJoyrideSteps} from "../Helper/JoyrideSteps";
import {useTranslation} from "../CustomHooks/useTranslation";

function App() {
    const settings = useSettings()
    const systemTheme = useThemeDetector()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const getDatabaseRoute = useAccountRoute()
    const translate = useTranslation()

    const location = useLocation()

    const transactions = useTransactions()

    const [initialPastTransactionsCheck, setInitialPastTransactionsCheck] = React.useState(false)
    const [userIsLoggedIn, setUserIsLoggedIn] = React.useState<boolean | null>(null)

    const [run, setRun] = React.useState(true)
    const [stepIndex, setStepIndex] = React.useState(0)

    // const handleJoyrideCallback = (data: CallBackProps) => {
    //     const { action, index, status, type } = data;
    //
    //     if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
    //         // Need to set our running state to false, so we can restart if we click start again.
    //         setRun(false);
    //         setStepIndex(0);
    //     } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
    //         const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
    //
    //         console.log(index, location.pathname)
    //
    //         if (index === 0 && location.pathname === RoutePath.HOME) {
    //             setStepIndex(nextStepIndex)
    //         } else if (index === 1 && location.pathname === RoutePath.CREATE_TRANSACTION) {
    //             setStepIndex(nextStepIndex)
    //         } else {
    //             setStepIndex(nextStepIndex)
    //         }
    //     }
    // }



    useEffect(() => {
        onAuthStateChanged(getAuth(), (user) => {
            setUserIsLoggedIn(user !== null)
        })
    }, []);

    useEffect(() => {
        if (initialPastTransactionsCheck || !currentAccount || !getDatabaseRoute || !transactions) return

        setInitialPastTransactionsCheck(true)

        executePastTransactions(transactions, currentAccount, updateAccountBalance, getDatabaseRoute)
    }, [currentAccount]);

    useEffect(() => {
        if (!settings || !getDatabaseRoute) return

        getActiveDatabaseHelper().getDBItemOnChange(getDatabaseRoute(), settings.currentAccountUid, (account) => {
            if (!account || (account as AccountModel).type === AccountType.DEFAULT) return

            getActiveDatabaseHelper().getDBObjects(
                getDatabaseRoute(DatabaseRoutes.DEBTS)
            ).then((debts) => {
                getActiveDatabaseHelper().getDBObjects(
                    getDatabaseRoute(DatabaseRoutes.PAYED_DEBTS)
                ).then((payedDebts) => {
                    const balances = calculateBalances(debts, payedDebts, (account as AccountModel).currencyCode)

                    getActiveDatabaseHelper().setDBObject(
                        getDatabaseRoute() + "/" + account.uid + "/balance",
                        balances.reduce((acc, balance) => balance.balance < 0 ? acc + balance.balance : acc, 0)
                    )
                })
            })
        })
    }, [settings, getDatabaseRoute])

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

    return <div className={"app " + getTheme()}>
        { userIsLoggedIn !== null && settings ?
            <Providers>
                {/*<Joyride*/}
                {/*    callback={handleJoyrideCallback}*/}
                {/*    run={run}*/}
                {/*    stepIndex={stepIndex}*/}
                {/*    continuous*/}
                {/*    scrollToFirstStep*/}
                {/*    showProgress*/}
                {/*    showSkipButton*/}
                {/*    steps={getJoyrideSteps(translate)}*/}
                {/*/>*/}

                <Routes>
                    <Route path={RoutePath.AUTHENTICATION} element={
                        <Redirect redirectIf={userIsLoggedIn} redirectTo={RoutePath.HOME}>
                            <AuthenticationScreen />
                        </Redirect>
                    } />
                    <Route path={`${RoutePath.INVITATIONS}/:inviteUrl`} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <InvitationsScreen />
                        </Redirect>
                    } />
                    <Route path={RoutePath.HOME} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <HomeOverlay />
                        </Redirect>
                    } />
                    <Route path={RoutePath.CREATE_TRANSACTION} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <CreateTransactionOverlay />
                        </Redirect>
                    } />
                    <Route path={RoutePath.TRANSACTION_OVERVIEW} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <Redirect redirectIf={currentAccount?.type === AccountType.DEBTS} redirectTo={RoutePath.EVALUATION}>
                                <TransactionOverviewOverlay />
                            </Redirect>
                        </Redirect>
                    } />
                    <Route path={RoutePath.EVALUATION} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <Redirect redirectIf={currentAccount?.type === AccountType.DEFAULT} redirectTo={RoutePath.TRANSACTION_OVERVIEW}>
                                <EvaluationOverlay />
                            </Redirect>
                        </Redirect>
                    } />
                    <Route path={RoutePath.TRANSACTIONS} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            { currentAccount?.type === AccountType.DEFAULT ? <TransactionsOverlay /> : <DebtOverlay /> }
                        </Redirect>
                    } />
                    <Route path={RoutePath.STORAGE} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <StorageOverlay />
                        </Redirect>
                    } />
                    <Route path={RoutePath.ACCOUNTS} element={
                        <Redirect redirectIf={!userIsLoggedIn} redirectTo={RoutePath.AUTHENTICATION}>
                            <AccountsOverlay />
                        </Redirect>
                    } />
                    <Route path={"*"} element={
                        <Navigate to="/home" />
                    } />
                </Routes>
            </Providers> : <Spinner type={SpinnerType.CYCLE} style={{height:"100vh"}} />}
    </div>
}

export default App;
